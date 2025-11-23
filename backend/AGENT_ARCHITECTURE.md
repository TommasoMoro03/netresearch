# Agent Architecture

## Overview

The NetResearch backend uses a modular agent architecture to generate research graphs from user queries. The system is built with clean separation of concerns and extensibility in mind.

## Architecture

```
app/
├── agents/                     # Agent implementations
│   ├── models.py              # Data models (AgentContext, ExtractedFilters)
│   ├── intent_agent.py        # Filter extraction from query + CV
│   └── orchestrator.py        # Pipeline coordinator
├── prompts/                    # LLM prompts (separated for easy editing)
│   └── intent_extraction.py  # Prompts for intent/filter extraction
├── services/
│   ├── state_manager.py       # In-memory state storage
│   └── simulation_service.py # Agent execution entry point
└── routers/
    └── agent.py               # API endpoints
```

## Pipeline Stages

The research graph generation follows these stages:

### 1. **Intent & Filter Extraction** ✅ IMPLEMENTED
- **Agent**: `IntentExtractionAgent`
- **Input**: User query + optional CV concepts
- **Output**: `ExtractedFilters` (topics, geographical_areas, research_types)
- **Step Types**: `intent` → `filters`

### 2. **OpenAlex Search** 🔄 TODO
- Search OpenAlex API for papers, authors, institutions
- Filter by extracted criteria
- **Step Type**: `search`

### 3. **Data Extraction** 🔄 TODO
- Extract detailed information from search results
- Identify professors, labs, institutions
- **Step Type**: `extraction`

### 4. **Relationship Building** 🔄 TODO
- Build connections between entities
- Identify collaborations, citations, affiliations
- **Step Type**: `relationships`

### 5. **Graph Construction** 🔄 TODO
- Construct final graph with nodes and links
- Generate metadata for each node
- **Step Type**: `graph`

## Agent Components

### AgentContext
Central data structure passed through the pipeline:
```python
class AgentContext(BaseModel):
    run_id: str
    query: str
    cv_id: Optional[str]
    cv_concepts: Optional[List[str]]
    max_nodes: int
    filters: Optional[ExtractedFilters]  # Populated during execution
```

### IntentExtractionAgent
Extracts structured filters from natural language query:
- Uses Together AI LLM via OpenAI SDK
- Prompts are in `app/prompts/intent_extraction.py`
- Returns JSON with topics, geographical areas, research types

### ResearchAgentOrchestrator
Coordinates the entire pipeline:
- Executes stages sequentially
- Updates state manager with progress
- Handles errors gracefully

## State Management

The `StateManager` tracks execution progress:
- **Step Structure**:
  ```python
  {
    "step_id": "filters-1",
    "step_type": "filters",  # intent|filters|search|extraction|relationships|graph
    "message": "Extracted research filters",
    "details": {"topics": [...], "geographical_areas": [...]},
    "sources": [],
    "status": "done",  # in_progress|done|pending
    "timestamp": "2025-01-22T..."
  }
  ```

## Frontend Integration

### Step Types for UI
- **`intent`**: Show loading state "Understanding user intentions..."
- **`filters`**: Display extracted filters in UI
- **`search`**: Show search progress
- **`extraction`**: Show entity extraction progress
- **`relationships`**: Show relationship building
- **`graph`**: Final graph construction

### API Flow
1. **POST** `/api/agent/run` - Start agent run
   - Returns `run_id`
2. **GET** `/api/agent/status/{run_id}` - Poll for updates
   - Returns steps array with progress
   - When `status="completed"`, includes `graph_data`

## Prompts

Prompts are stored in `app/prompts/` for easy editing:
- **System prompts**: Define agent role and output format
- **User prompts**: Include placeholders for dynamic content
- **Example**: `{query}`, `{cv_concepts}`

## Adding New Agents

To add a new agent stage:

1. Create agent class in `app/agents/`:
   ```python
   class NewAgent:
       def __init__(self):
           self.client = get_openai_client()

       def execute(self, context: AgentContext) -> Result:
           # Implementation
   ```

2. Add prompts to `app/prompts/new_agent.py`

3. Update `ResearchAgentOrchestrator.run()`:
   ```python
   def run(self, context: AgentContext):
       self._execute_intent_extraction(context)
       self._execute_new_stage(context)  # Add here
       # ...
   ```

4. Add step type to `StepLog` schema in `app/schemas/agent.py`

## Configuration

Agents use the centralized config system:
- Together AI credentials from `.env`
- Model name configurable via `MODEL_NAME`
- Access via `from app.core.config import settings`

## Testing

Test individual agents:
```python
from app.agents.intent_agent import IntentExtractionAgent

agent = IntentExtractionAgent()
filters = agent.extract_filters(
    query="Find robotics researchers in Europe",
    cv_concepts=["Machine Learning", "Computer Vision"]
)
print(filters.topics)  # ["Robotics", "Machine Learning", ...]
```

## Error Handling

- Agents catch and log errors to state manager
- Pipeline continues with placeholder data if agent fails
- Frontend receives error in step message
- Run still completes (status="completed")

## Next Steps

1. Implement OpenAlex search agent
2. Implement data extraction agent
3. Implement relationship building agent
4. Replace mock graph data with real graph
5. Add caching for API calls
6. Add retry logic for LLM calls
