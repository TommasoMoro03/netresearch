from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from app.schemas.cv import CVUploadResponse
from app.services.state_manager import state_manager
from app.services.cv_service import cv_service
from app.database.database import db
from app.auth.dependencies import get_current_user_id
import uuid

router = APIRouter(prefix="/api/cv", tags=["CV"])


@router.post("/upload", response_model=CVUploadResponse)
async def upload_cv(
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id)
):
    """
    Upload a CV (PDF file) and extract concepts.
    Requires authentication.
    """
    # Validate file type
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Generate unique CV ID
    cv_id = str(uuid.uuid4())

    try:
        # Read file content
        content = await file.read()

        # Extract text from PDF
        text = cv_service.extract_text_from_pdf(content)

        # Extract concepts using LLM
        extracted_concepts = cv_service.extract_concepts_from_text(text)

        # Store in state manager
        state_manager.store_cv(cv_id, {
            "cv_id": cv_id,
            "filename": file.filename,
            "concepts": extracted_concepts,
            "text_preview": text[:200] + "..." # Store preview for debugging
        })

        # Save CV text to database for authenticated user
        db.update_user_details(user_id=user_id, cv_transcribed=text)

        return CVUploadResponse(
            cv_id=cv_id,
            filename=file.filename,
            message="CV processed successfully",
            extracted_concepts=extracted_concepts
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CV: {str(e)}")
