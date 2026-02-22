import React, { useEffect, useRef } from 'react';

const EXPERIMENT_ID = 7;
const PROJECT_ID = 6;

const SEGMENTS = [
  { id: 13, name: 'A', preview_hash: '5Z5JJthcASE', percentage: 0.5 },
  { id: 14, name: 'B', preview_hash: 'l7Le6yQyE8Q', percentage: 0.5 },
];

function getSegment() {
  const urlHash = new URLSearchParams(window.location.search).get('x');
  if (urlHash) {
    const forced = SEGMENTS.find((s) => s.preview_hash === urlHash);
    if (forced) return forced;
  }
  const rand = Math.random();
  return rand < 0.5 ? SEGMENTS[0] : SEGMENTS[1];
}

function trackEvent(eventId: string, segmentId: number, segmentName: string) {
  fetch('http://localhost:9000/webhook/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: eventId,
      segment_id: segmentId,
      segment_name: segmentName,
      experiment_id: EXPERIMENT_ID,
      project_id: PROJECT_ID,
      timestamp: new Date().toISOString(),
      metadata: {},
    }),
  }).catch(() => {});
}

export default function BoldTitleExperiment() {
  const segment = React.useMemo(() => getSegment(), []);
  const viewTracked = useRef(false);

  useEffect(() => {
    if (!viewTracked.current) {
      viewTracked.current = true;
      trackEvent('button_view', segment.id, segment.name);
    }
  }, [segment]);

  const handleClick = () => {
    trackEvent('button_click', segment.id, segment.name);
  };

  const isVariantB = segment.id === 14;

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: isVariantB ? 900 : 400,
          marginBottom: '1.5rem',
        }}
      >
        NetResearch — Visualize Your Research Network
      </h1>
      <button
        onClick={handleClick}
        style={{
          padding: '0.75rem 2rem',
          fontSize: '1rem',
          cursor: 'pointer',
          borderRadius: '6px',
          border: '1px solid #ccc',
          background: '#4f46e5',
          color: '#fff',
        }}
      >
        Get Started
      </button>
      <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#888' }}>
        Segment: {segment.name}
      </p>
    </div>
  );
}
