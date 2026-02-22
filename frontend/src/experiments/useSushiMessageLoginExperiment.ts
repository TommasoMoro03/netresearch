// Experiment: Sushi Message Login Update
// Experiment ID: 4 | Project ID: 1
// Segments: A (id: 7, keep original) | B (id: 8, add sushi sentence)

const EXPERIMENT_ID = 4;
const PROJECT_ID = 1;
const WEBHOOK_URL = "http://localhost:9000/webhook/event";

const SEGMENTS = [
  {
    id: 7,
    name: "A",
    instructions: "keep original",
    percentage: 0.5,
    preview_hash: "stEKR6ALy9g",
  },
  {
    id: 8,
    name: "B",
    instructions: "add sushi sentence before welcome back text in login form",
    percentage: 0.5,
    preview_hash: "f2zxK7zV5Es",
  },
] as const;

export type Segment = (typeof SEGMENTS)[number];

/** Resolve which segment to use.
 *  1. Check URL ?x= for a preview hash override.
 *  2. Otherwise randomly assign based on percentages.
 */
export function resolveSegment(): Segment {
  const urlHash =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("x")
      : null;

  if (urlHash) {
    const forced = SEGMENTS.find((s) => s.preview_hash === urlHash);
    if (forced) return forced;
  }

  // Random assignment (cumulative percentage buckets)
  const rand = Math.random();
  let cumulative = 0;
  for (const segment of SEGMENTS) {
    cumulative += segment.percentage;
    if (rand < cumulative) return segment;
  }
  // Fallback to last segment
  return SEGMENTS[SEGMENTS.length - 1];
}

/** Fire a tracking event to the webhook. */
export function trackEvent(
  eventId: "login_button_view" | "login_button_click",
  segment: Segment,
  userId?: string
): void {
  fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_id: eventId,
      segment_id: segment.id,
      segment_name: segment.name,
      experiment_id: EXPERIMENT_ID,
      project_id: PROJECT_ID,
      timestamp: new Date().toISOString(),
      ...(userId ? { user_id: userId } : {}),
      metadata: {},
    }),
  }).catch(() => {
    // Silently ignore tracking errors to avoid disrupting UX
  });
}
