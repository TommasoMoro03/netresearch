const EXPERIMENT_ID = 6;
const PROJECT_ID = 1;
const WEBHOOK_URL = 'http://localhost:9000/webhook/event';

export interface TrackingPayload {
  event_id: string;
  segment_id: number;
  segment_name: string;
  experiment_id: number;
  project_id: number;
  timestamp: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
}

export function trackEvent(
  eventId: string,
  segmentId: number,
  segmentName: string,
  metadata: Record<string, unknown> = {}
): void {
  const payload: TrackingPayload = {
    event_id: eventId,
    segment_id: segmentId,
    segment_name: segmentName,
    experiment_id: EXPERIMENT_ID,
    project_id: PROJECT_ID,
    timestamp: new Date().toISOString(),
    metadata,
  };
  console.debug('[AB-Experiment] Dispatching event:', payload);
  fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch((err) => {
    console.error('[AB-Experiment] Failed to send event:', err);
  });
}
