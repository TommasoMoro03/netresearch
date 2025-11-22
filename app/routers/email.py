from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.email_service import email_service

router = APIRouter(prefix="/api/email", tags=["Email"])

class EmailGenerateRequest(BaseModel):
    topic: str
    recipient_name: Optional[str] = "Colleague"

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
    Generate an email based on a topic using LLM.
    """
    try:
        content = email_service.generate_email(request.topic, request.recipient_name)
        return EmailGenerateResponse(
            content=content,
            message="Email generated successfully"
        )
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
