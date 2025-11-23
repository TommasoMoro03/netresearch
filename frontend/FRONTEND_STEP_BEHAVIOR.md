# Backend Step Behavior for Frontend

## Important: Step Message Pattern

Each step in the `steps` array follows this pattern:

1. **When step starts**: Backend adds step with `status: "in_progress"` and a **message**
2. **When step completes**: Backend updates THE SAME step with `status: "done"` and THE SAME message, plus step-specific data

**Key points:**
- Each step has only ONE message that persists from `in_progress` to `done`
- The message does NOT change between `in_progress` and `done`
- Frontend should show the message while `status === "in_progress"`, then collapse/hide it when the next step starts
- Step-specific data (filters, papers, professors) is added only when `status === "done"`

**Example flow:**
```javascript
// Poll 1: Step shows in progress
{ step_id: "filters-1", status: "in_progress", message: "Understanding your research interests..." }

// Poll 2: Same step now done with data
{ step_id: "filters-1", status: "done", message: "Understanding your research interests...", filters: {...} }

// Poll 3: Next step starts
{ step_id: "search-1", status: "in_progress", message: "Looking for relevant papers..." }
```

**Frontend behavior:**
- Show current `in_progress` step's message
- When new step starts, collapse previous step
- Only the active `in_progress` step should be prominently displayed
