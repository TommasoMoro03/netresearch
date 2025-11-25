from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse
from app.agents.professor_chat_agent import professor_chat_agent
from app.database.database import db
from app.services.state_manager import state_manager

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("/message", response_model=ChatMessageResponse)
async def send_chat_message(request: ChatMessageRequest):
    """Handle a chat request for a professor node.

    Retrieves user context (name, CV) and professor details from the
    persisted SQLite database, then forwards everything to the
    ``ProfessorChatAgent`` which uses ``pyagentspec`` to call the LLM.
    """
    try:
        # 1️⃣ User context
        user = db.get_user()
        user_name = user["name"] if user else (state_manager.get_user_name() or "Student")
        user_cv = user["cv_transcribed"] if user else ""

        # 2️⃣ Run & graph data
        run = db.get_run(request.run_id)
        if not run:
            raise HTTPException(status_code=404, detail=f"Run {request.run_id} not found")
        graph_data = run.get("graph_data")
        if not graph_data:
            raise HTTPException(status_code=404, detail="Graph data missing for this run")

        # 3️⃣ Locate professor node
        nodes = graph_data.get("nodes", [])
        target_node = next((n for n in nodes if n.get("id") == request.node_id), None)
        if not target_node:
            # fallback to matching by name
            target_node = next((n for n in nodes if n.get("name") == request.node_id), None)
        if not target_node:
            raise HTTPException(status_code=404, detail=f"Professor node {request.node_id} not found")

        # 4️⃣ Extract professor details (properties are at root level, not nested)
        professor_name = target_node.get("name") or "Unknown Professor"
        professor_description = target_node.get("description", "No description available")
        institution = target_node.get("institution", "Not specified")
        
        # Metrics are at root level
        works_count = target_node.get("works_count")
        cited_by_count = target_node.get("cited_by_count")
        h_index = target_node.get("h_index")
        papers = target_node.get("papers", [])

        # 5️⃣ Call the LLM via the agent
        response_content = professor_chat_agent.ask_question(
            user_question=request.message,
            professor_name=professor_name,
            professor_description=professor_description,
            institution=institution,
            works_count=works_count,
            cited_by_count=cited_by_count,
            h_index=h_index,
            papers=papers,
            user_name=user_name,
            user_cv=user_cv,
        )

        return ChatMessageResponse(content=response_content)
    except HTTPException:
        raise
    except Exception as e:
        # Log the error for debugging and return a generic 500
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate chat response: {str(e)}")
