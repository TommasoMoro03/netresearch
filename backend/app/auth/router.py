"""Authentication router with login, register, and user management endpoints."""
from fastapi import APIRouter, HTTPException, status, Depends
from app.auth.schemas import (
    UserRegister,
    UserLogin,
    Token,
    UserResponse,
    UserDetailsResponse,
    UserDetailsUpdate
)
from app.auth.service import hash_password, verify_password, create_access_token
from app.auth.dependencies import get_current_user_id
from app.database.database import db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """
    Register a new user account.

    Args:
        user_data: User registration data including email, password, and optional name

    Returns:
        JWT access token

    Raises:
        HTTPException: If email already exists
    """
    # Check if user already exists
    existing_user = db.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = hash_password(user_data.password)

    # Create user
    user_id = db.create_user(
        email=user_data.email,
        hashed_password=hashed_password
    )

    # Create user details if name provided
    if user_data.name:
        db.create_user_details(user_id=user_id, name=user_data.name)

    # Create access token
    access_token = create_access_token(
        data={"user_id": user_id, "email": user_data.email}
    )

    return Token(access_token=access_token)


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """
    Login with email and password.

    Args:
        credentials: Login credentials (email and password)

    Returns:
        JWT access token

    Raises:
        HTTPException: If credentials are invalid
    """
    # Get user by email
    user = db.get_user_by_email(credentials.email)

    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    # Update last login
    db.update_last_login(user["id"])

    # Create access token
    access_token = create_access_token(
        data={"user_id": user["id"], "email": user["email"]}
    )

    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(user_id: int = Depends(get_current_user_id)):
    """
    Get current authenticated user information.

    Returns:
        User information (without password)
    """
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse(
        id=user["id"],
        email=user["email"],
        is_active=user["is_active"],
        created_at=user["created_at"],
        last_login=user["last_login"]
    )


@router.get("/me/details", response_model=UserDetailsResponse)
async def get_user_details(user_id: int = Depends(get_current_user_id)):
    """
    Get current user's profile details.

    Returns:
        User profile details (name, CV status)
    """
    details = db.get_user_details(user_id)

    if details:
        return UserDetailsResponse(
            name=details["name"],
            has_cv=bool(details["cv_transcribed"])
        )
    else:
        return UserDetailsResponse(name=None, has_cv=False)


@router.put("/me/details", response_model=UserDetailsResponse)
async def update_user_details(
    update_data: UserDetailsUpdate,
    user_id: int = Depends(get_current_user_id)
):
    """
    Update current user's profile details.

    Args:
        update_data: Updated profile data

    Returns:
        Updated user details
    """
    # Update user details
    db.update_user_details(user_id=user_id, name=update_data.name)

    # Return updated details
    details = db.get_user_details(user_id)
    if details:
        return UserDetailsResponse(
            name=details["name"],
            has_cv=bool(details["cv_transcribed"])
        )
    else:
        return UserDetailsResponse(name=update_data.name, has_cv=False)
