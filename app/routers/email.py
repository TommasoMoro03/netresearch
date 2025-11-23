from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from app.services.email_service import email_service
from app.services.state_manager import state_manager
from app.database.database import db

router = APIRouter(prefix="/api/email", tags=["Email"])

from enum import Enum

class EmailType(str, Enum):
    COLAB = "colab"
    REACH_OUT = "reach_out"

from pydantic import BaseModel, Field

class EmailGenerateRequest(BaseModel):
    email_type: EmailType = Field(default=EmailType.COLAB, alias="email_type")
    professor_name: str = Field(default="", alias="professor_name")
    cv_id: Optional[str] = None
    professor_context: Optional[str] = ""
    recipient_name: Optional[str] = None

    class Config:
        allow_population_by_field_name = True

class EmailGenerateResponse(BaseModel):
    content: str
    message: str

class EmailSendRequest(BaseModel):
    email_content: str
    recipient_email: str

class EmailSendResponse(BaseModel):
    status: str
    message: str

@router.post("/generate", response_model=EmailGenerateResponse)
async def generate_email(request: EmailGenerateRequest):
    """
    Generate an email based on type and context using LLM.
    """
    try:
        # Fetch CV data - make it optional
        cv_text = ""
        cv_concepts = []
        
        # First try state_manager (in-memory) if cv_id provided
        cv_data = None
        if request.cv_id:
            cv_data = state_manager.get_cv(request.cv_id)
        
        # If not found, try DB (persistence)
        if not cv_data:
            user = db.get_user()
            if user and user.get("cv_transcribed"):
                # Reconstruct CV data structure from DB
                cv_data = {
                    "text_preview": user["cv_transcribed"],
                    "concepts": []
                }
        
        # Extract CV info if available
        if cv_data:
            cv_text = cv_data.get("text_preview", "")
            cv_concepts = cv_data.get("concepts", [])
        
        # Get student name
        student_name = state_manager.get_user_name()
        if not student_name:
            user = db.get_user()
            if user:
                student_name = user["name"]
        
        # Generate email
        content = email_service.generate_email(
            email_type=request.email_type.value,
            professor_name=request.professor_name,
            professor_context=request.professor_context,
            cv_text=cv_text,
            cv_concepts=cv_concepts,
            student_name=student_name,
            recipient_name=request.recipient_name
        )
        
        return EmailGenerateResponse(
            content=content,
            message="Email generated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send", response_model=EmailSendResponse)
async def send_email(request: EmailSendRequest):
    """
    Send an email (TODO).
    """
    # TODO: Implement real sending logic
    return EmailSendResponse(
        status="pending",
        message="Email sending is not implemented yet (TODO)"
    )
