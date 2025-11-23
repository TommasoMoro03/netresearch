# Backend API Documentation

**Base URL:** `http://localhost:8000`

## Endpoints

### 1. POST `/agent/run`
Start a new research agent run.

**Request Body:**
```json
{
  "query": "string",
  "cv_id": "string (optional)",
  "max_nodes": 10
}
```

**Response:**
```json
{
  "run_id": "uuid",
  "status": "running"
}
```

---

### 2. GET `/agent/status/{run_id}`
Poll for agent progress and results. Call this repeatedly to get real-time updates.

**Response:**
```json
{
  "run_id": "uuid",
  "status": "running" | "completed",
  "steps": [
    {
      "step_id": "string",
      "step_type": "intent" | "filters" | "search" | "extraction" | "relationships" | "graph",
      "message": "string",
      "status": "pending" | "in_progress" | "done",
      "timestamp": "ISO8601",
      "filters": {"topics": [], "geographical_areas": []},  // Only in "filters" step
      "papers": [{title, link, abstract, publication_year, topic}],  // Only in "search" step (first 4 papers)
      "professors": [{name, institution: {id, name}, description}]  // Only in "extraction" step
    }
  ],
  "graph_data": {  // Only present when status="completed"
    "nodes": [{
      "id": "string",
      "name": "string",
      "type": "professor" | "user",
      "institution": {"id": "string", "name": "string"},
      "description": "string",
      "contacts": {"email": "string", "website": "string"},
      "works_count": 123,
      "cited_by_count": 456,
      "h_index": 12,
      "link_orcid": "string",
      "papers": [{title, link, abstract, publication_year, topic}]
    }],
    "links": [{
      "source": "node_id",
      "target": "node_id",
      "label": "supervises" | "interested_in"
    }]
  }
}
```

**Notes:**
- Poll this endpoint every 1-2 seconds while `status === "running"`
- `steps` array shows progressive updates (filters → search → extraction → relationships → graph)
- Step-specific fields (`filters`, `papers`, `professors`) only appear in their respective steps
- `graph_data` only appears when `status === "completed"`

---

### 3. POST `/cv/upload`
Upload a CV file (PDF).

**Request:** `multipart/form-data` with file field

**Response:**
```json
{
  "cv_id": "uuid",
  "filename": "string"
}
```

---

## Pipeline Steps

The agent executes these steps in order:

1. **intent** → Understanding user query
2. **filters** → Extracting topics and geographical areas
3. **search** → Finding relevant papers from OpenAlex
4. **extraction** → Extracting professors from papers
5. **relationships** → Building links between professors
6. **graph** → Constructing final 3D graph

Each step transitions through: `pending` → `in_progress` → `done`
