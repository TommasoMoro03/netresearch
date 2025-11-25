# Frontend Auto-Expand/Collapse Fix

## Problem
Currently, steps only show an arrow when done, and require manual click to expand. Need to auto-expand steps when they start and auto-collapse when moving to next step.

## Required Behavior

1. **Auto-expand on step start**: When a step has `status === "in_progress"`, it should be automatically expanded (no arrow click needed)
2. **Show content immediately**: The step-specific content (filters, papers, professors) is now available even when `status === "in_progress"`, so display it right away
3. **Auto-collapse on next step**: When a new step becomes active (`in_progress`), all previous steps should collapse automatically
4. **No arrow needed for active step**: The currently active `in_progress` step should show content without needing to click anything

## Implementation Hints

In `ReasoningConsole.tsx`:

1. The `expandedSteps` state should automatically include any step with `status === "in_progress"`
2. When rendering step content (filters, papers, professors), show it for the active step without requiring manual expansion
3. When a new step becomes active, update `expandedSteps` to only include that step
4. The arrow/chevron UI should only be visible for completed (`status === "done"`) steps, allowing users to manually re-expand if needed

## Backend Guarantee

The backend now provides step-specific data (filters, papers, professors) immediately when `status === "in_progress"`, so the frontend can display content right away without waiting for `status === "done"`.

## Expected User Experience

1. User sees "Understanding your research interests..." - filters appear immediately below
2. Step auto-collapses, new step appears: "Looking for relevant papers..." - papers appear immediately
3. Step auto-collapses, new step appears: "Extracting relevant professors..." - professors appear immediately
4. User can click arrows on completed steps to re-expand them if desired
