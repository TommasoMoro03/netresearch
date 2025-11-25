from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends
from app.schemas.agent import AgentRunRequest, AgentRunResponse, AgentStatusResponse
from app.services.state_manager import state_manager
from app.services.simulation_service import run_research_agent
from app.database.database import db
from app.auth.dependencies import get_current_user_id
import uuid

router = APIRouter(prefix="/api/agent", tags=["Agent"])


@router.post("/run", response_model=AgentRunResponse)
async def start_agent_run(
    request: AgentRunRequest,
    background_tasks: BackgroundTasks,
    user_id: int = Depends(get_current_user_id)
):
    """
    Start a new agent run.
    Initializes the run state and starts background processing.
    Requires authentication.
    """
    # Generate unique run ID
    run_id = str(uuid.uuid4())

    # Get CV concepts if CV ID is provided
    cv_concepts = None
    if request.cv_id:
        cv_data = state_manager.get_cv(request.cv_id)
        if cv_data:
            cv_concepts = cv_data.get("concepts", [])

    # Create run in database with user_id
    db.create_run(run_id=run_id, user_id=user_id, query=request.query)

    # Create run in state manager
    state_manager.create_run(
        run_id=run_id,
        query=request.query,
        cv_id=request.cv_id,
        max_nodes=request.max_nodes
    )

    # Start background agent execution
    background_tasks.add_task(
        run_research_agent,
        run_id=run_id,
        query=request.query,
        max_nodes=request.max_nodes,
        cv_id=request.cv_id,
        cv_concepts=cv_concepts
    )

    return AgentRunResponse(run_id=run_id, status="started")


@router.get("/status/{run_id}", response_model=AgentStatusResponse)
async def get_agent_status(run_id: str):
    """
    Poll the status of an agent run.
    Returns current status, steps, and graph data (when completed).
    """
    run_data = state_manager.get_run(run_id)

    if not run_data:
        raise HTTPException(status_code=404, detail="Run not found")

    return AgentStatusResponse(
        run_id=run_data["run_id"],
        status=run_data["status"],
        steps=run_data["steps"],
        graph_data=run_data["graph_data"]
    )


@router.get("/runs")
async def get_all_runs(user_id: int = Depends(get_current_user_id)):
    """
    Get all past runs from the database for the current user.
    Returns list of runs with id, query, and graph_data.
    Requires authentication.
    """
    try:
        runs = db.list_runs(user_id=user_id)
        # Only return runs that have graph_data (completed runs)
        completed_runs = [
            {
                "id": run["id"],
                "query": run["query"],
                "has_graph": run["graph_data"] is not None
            }
            for run in runs
            if run["graph_data"] is not None
        ]
        return {"runs": completed_runs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch runs: {str(e)}")


@router.get("/run/{run_id}")
async def get_run_by_id(run_id: str, user_id: int = Depends(get_current_user_id)):
    """
    Get a specific run by ID from the database.
    Returns the full run data including graph_data.
    Only returns runs belonging to the authenticated user.
    """
    try:
        run = db.get_run(run_id, user_id=user_id)
        if not run:
            raise HTTPException(status_code=404, detail="Run not found")

        return {
            "id": run["id"],
            "query": run["query"],
            "graph_data": run["graph_data"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch run: {str(e)}")
