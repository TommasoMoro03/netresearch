import { useEffect } from 'react';

const SEGMENT_ID = 7;
const SEGMENT_NAME = 'control';
const EXPERIMENT_ID = 4;
const PROJECT_ID = 2;

const trackEvent = (event_id: string) => {
  fetch('http://localhost:9000/webhook/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id,
      segment_id: SEGMENT_ID,
      segment_name: SEGMENT_NAME,
      experiment_id: EXPERIMENT_ID,
      project_id: PROJECT_ID,
      timestamp: new Date().toISOString(),
      user_id: null,
      metadata: {}
    })
  }).catch(() => {});
};

export default function ControlVariant() {
  useEffect(() => {
    trackEvent('signup_button_view');
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#f1f5f9', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>Welcome Back</h1>
      <p style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '2rem' }}>Sign up to explore your research network.</p>
      <button
        onClick={() => trackEvent('signup_button_click')}
        style={{
          padding: '0.75rem 2rem',
          fontSize: '1rem',
          fontWeight: 600,
          background: '#6366f1',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Sign Up
      </button>
    </div>
  );
}
