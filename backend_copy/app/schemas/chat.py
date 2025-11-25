from pydantic import BaseModel
from typing import Optional


class ChatMessageRequest(BaseModel):
    """Request to send a chat message about a professor"""
    message: str
    run_id: str
    node_id: str  # Can be ID or Name depending on how frontend sends it, usually ID in graph


class ChatMessageResponse(BaseModel):
    """Response from the chat agent"""
    content: str
