"""
Data models for agent operations.
"""
from pydantic import BaseModel
from typing import List, Optional


class ExtractedFilters(BaseModel):
    """Filters extracted from user query and CV"""
    topics: List[str]
    geographical_areas: List[str]
    research_types: List[str]


class AgentContext(BaseModel):
    """Context for agent execution"""
    run_id: str
    query: str
    cv_id: Optional[str] = None
    cv_concepts: Optional[List[str]] = None
    max_nodes: int = 10

    # Extracted information during execution
    filters: Optional[ExtractedFilters] = None
