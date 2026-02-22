const EXPERIMENT_ID = 5;
const PROJECT_ID = 1;

const SEGMENTS = [
  { id: 9, name: "A", preview_hash: "oOwLEFn97lM", percentage: 0.5 },
  { id: 10, name: "B", preview_hash: "4QU_6QcF_QY", percentage: 0.5 },
];

function assignSegment() {
  const urlHash = new URLSearchParams(window.location.search).get("x");
  if (urlHash) {
    const forced = SEGMENTS.find((s) => s.preview_hash === urlHash);
    if (forced) return forced;
  }

  const stored = localStorage.getItem("exp_5_segment");
  if (stored) {
    const parsed = JSON.parse(stored);
    const found = SEGMENTS.find((s) => s.id === parsed.id);
    if (found) return found;
  }

  const rand = Math.random();
  let cumulative = 0;
  for (const seg of SEGMENTS) {
    cumulative += seg.percentage;
    if (rand < cumulative) {
      localStorage.setItem("exp_5_segment", JSON.stringify(seg));
      return seg;
    }
  }
  localStorage.setItem("exp_5_segment", JSON.stringify(SEGMENTS[0]));
  return SEGMENTS[0];
}

export function getSegment() {
  return assignSegment();
}

export function trackEvent(
  eventId: string,
  segmentId: number,
  segmentName: string,
  userId?: string
) {
  fetch("http://localhost:9000/webhook/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_id: eventId,
      segment_id: segmentId,
      segment_name: segmentName,
      experiment_id: EXPERIMENT_ID,
      project_id: PROJECT_ID,
      timestamp: new Date().toISOString(),
      user_id: userId ?? undefined,
      metadata: {},
    }),
  }).catch(() => {});
}
