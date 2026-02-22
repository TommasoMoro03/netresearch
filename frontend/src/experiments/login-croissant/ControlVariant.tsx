import { useEffect, useRef } from 'react';
import { trackEvent } from './tracking';

const SEGMENT_ID = 11;
const SEGMENT_NAME = 'control';

export default function ControlVariant() {
  const viewTracked = useRef(false);

  useEffect(() => {
    // page_load_confirmation
    trackEvent('page_load_confirmation', SEGMENT_ID, SEGMENT_NAME);
    console.debug('[AB-Experiment] page_load_confirmation dispatched for control');

    // login_button_view - fired on form render
    if (!viewTracked.current) {
      viewTracked.current = true;
      trackEvent('login_button_view', SEGMENT_ID, SEGMENT_NAME);
      console.debug('[AB-Experiment] login_button_view dispatched for control');
    }
  }, []);

  const handleLoginClick = () => {
    trackEvent('login_button_click', SEGMENT_ID, SEGMENT_NAME);
    console.debug('[AB-Experiment] login_button_click dispatched for control');
    // Redirect to actual Google OAuth or login flow
    window.location.href = '/';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          color: '#f1f5f9',
        }}
      >
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            marginBottom: '8px',
            textAlign: 'center',
            color: '#f1f5f9',
          }}
        >
          Welcome Back
        </h1>
        <p
          style={{
            color: '#94a3b8',
            textAlign: 'center',
            marginBottom: '32px',
            fontSize: '0.95rem',
          }}
        >
          Sign in to continue to NetResearch
        </p>
        <button
          onClick={handleLoginClick}
          style={{
            width: '100%',
            padding: '12px 24px',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#2563eb';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#3b82f6';
          }}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
