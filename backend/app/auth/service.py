"""Authentication service for password hashing and JWT token management."""
from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple
import bcrypt
from jose import JWTError, jwt
from app.auth.schemas import TokenData, UserRegister, UserLogin
from app.database.database import db

# JWT settings
SECRET_KEY = "KEY"  # TODO: Move to environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def hash_password(password: str) -> str:
    """Hash a password using bcrypt directly."""
    # Convert password to bytes
    password_bytes = password.encode('utf-8')
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    # Return as string
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash using bcrypt directly."""
    try:
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[TokenData]:
    """Decode and verify a JWT access token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("id")
        email: str = payload.get("email")

        if user_id is None or email is None:
            return None

        return TokenData(user_id=user_id, email=email)
    except JWTError:
        return None


class AuthService:
    """Service class for authentication operations."""

    def signup(self, signup_data: UserRegister) -> Tuple[dict, str]:
        """
        Register a new user.
        Returns tuple of (user_dict, token).
        Raises ValueError if email already exists.
        """
        # Check if user already exists
        existing_user = db.get_user_by_email(signup_data.email)
        if existing_user:
            raise ValueError("Email already registered")

        # Hash password
        hashed_password = hash_password(signup_data.password)

        # Create user
        user_id = db.create_user(
            email=signup_data.email,
            hashed_password=hashed_password
        )

        # Create user details if name provided
        if signup_data.name:
            db.create_user_details(user_id=user_id, name=signup_data.name)

        # Get created user
        user = db.get_user_by_id(user_id)

        # Create access token
        token = create_access_token(data={"id": user_id, "email": signup_data.email})

        return (user, token)

    def login(self, login_data: UserLogin) -> Tuple[dict, str]:
        """
        Login a user with email and password.
        Returns tuple of (user_dict, token).
        Raises ValueError if credentials are invalid.
        """
        # Get user by email
        user = db.get_user_by_email(login_data.email)

        if not user:
            raise ValueError("Invalid credentials")

        # Verify password
        if not verify_password(login_data.password, user["hashed_password"]):
            raise ValueError("Invalid credentials")

        # Check if user is active
        if not user["is_active"]:
            raise ValueError("Account is inactive")

        # Update last login
        db.update_last_login(user["id"])

        # Create access token
        token = create_access_token(data={"id": user["id"], "email": user["email"]})

        return (user, token)
