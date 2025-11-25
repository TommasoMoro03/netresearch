from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.state_manager import state_manager
from app.database.database import db
from app.auth.dependencies import get_current_user_id

router = APIRouter(prefix="/api", tags=["User"])


class UserNameRequest(BaseModel):
    name: str


class UserNameResponse(BaseModel):
    message: str
    name: str


@router.post("/name", response_model=UserNameResponse)
async def set_user_name(
    request: UserNameRequest,
    user_id: int = Depends(get_current_user_id)
):
    """
    Store the user's name for use in emails and visualization.
    Requires authentication.
    """
    state_manager.set_user_name(request.name)

    # Save to database
    db.update_user_details(user_id=user_id, name=request.name)

    return UserNameResponse(
        message="User name stored successfully",
        name=request.name
    )


@router.get("/name", response_model=UserNameResponse)
async def get_user_name(user_id: int = Depends(get_current_user_id)):
    """
    Retrieve the stored user name.
    Requires authentication.
    """
    # Try to get from state manager first
    name = state_manager.get_user_name()

    # If not in state, get from database
    if not name:
        details = db.get_user_details(user_id)
        if details and details["name"]:
            name = details["name"]
            state_manager.set_user_name(name)

    return UserNameResponse(
        message="User name retrieved successfully",
        name=name or "Anonymous"
    )


@router.get("/user")
async def get_user_data(user_id: int = Depends(get_current_user_id)):
    """
    Get user data from database (name and CV status).
    Requires authentication.
    """
    details = db.get_user_details(user_id)

    if details:
        return {
            "name": details["name"] or "",
            "has_cv": bool(details["cv_transcribed"] and details["cv_transcribed"].strip())
        }

    return {
        "name": "",
        "has_cv": False
    }


@router.post("/reset")
async def clean_history():
    """
    Reset all data in the database (delete all users and runs).
    """
    try:
        db.reset_all_data()
        # Also clear in-memory state
        state_manager.cv_store.clear()
        state_manager.run_store.clear()
        state_manager.user_name = None

        return {
            "message": "History cleaned successfully",
            "status": "success"
        }
    except Exception as e:
        return {
            "message": f"Failed to clean history: {str(e)}",
            "status": "error"
        }


@router.get("/debug")
async def debug_state():
    """
    Debug endpoint to check current state.
    """
    return {
        "user_name": state_manager.get_user_name(),
        "cv_count": len(state_manager.cv_store),
        "run_count": len(state_manager.run_store)
    }
