import React, { useEffect } from 'react';

const EXPERIMENT_ID = 5;
const PROJECT_ID = 3;
const WEBHOOK_URL = 'http://localhost:9000/webhook/event';

const SEGMENTS = [
  { id: 9, name: 'Control', percentage: 0.4 },
  { id: 10, name: 'Variant B', percentage: 0.6 },
];

function assignSegment(): { id: number; name: string } {
  const stored = localStorage.getItem('exp_5_segment');
  if (stored) {
    return JSON.parse(stored);
  }

  // 80% of users participate in experiment
  const participates = Math.random() < 0.8;
  if (!participates) {
    const segment = SEGMENTS[0]; // default to control if not participating
    localStorage.setItem('exp_5_segment', JSON.stringify(segment));
    return segment;
  }

  const rand = Math.random();
  const segment = rand < 0.4 ? SEGMENTS[0] : SEGMENTS[1];
  localStorage.setItem('exp_5_segment', JSON.stringify(segment));
  return segment;
}

function trackEvent(eventId: string, segmentId: number, segmentName: string, userId?: string) {
  fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: eventId,
      segment_id: segmentId,
      segment_name: segmentName,
      experiment_id: EXPERIMENT_ID,
      project_id: PROJECT_ID,
      timestamp: new Date().toISOString(),
      user_id: userId,
      metadata: {},
    }),
  }).catch(() => {});
}

export interface ExperimentLoginProps {
  children: React.ReactNode;
  userId?: string;
}

export const ExperimentLoginWrapper: React.FC<ExperimentLoginProps> = ({ children, userId }) => {
  const segment = assignSegment();

  useEffect(() => {
    trackEvent('page_view', segment.id, segment.name, userId);
  }, [segment.id, segment.name, userId]);

  const handlePizzaClick = () => {
    trackEvent('pizza_message_click', segment.id, segment.name, userId);
  };

  const isVariantB = segment.id === 10;

  return (
    <div style={{ width: '100%' }}>
      {isVariantB && (
        <div
          onClick={handlePizzaClick}
          style={{
            backgroundColor: '#fff7ed',
            border: '2px solid #fb923c',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#c2410c',
            fontWeight: 500,
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handlePizzaClick()}
        >
          <span style={{ fontSize: '20px' }}>🍕</span>
          <span>Welcome! Did you know researchers run on pizza? Click here to celebrate the NetResearch launch!</span>
        </div>
      )}
      {children}
    </div>
  );
};

export default ExperimentLoginWrapper;
