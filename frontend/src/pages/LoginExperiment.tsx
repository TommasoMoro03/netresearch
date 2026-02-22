import React from 'react';
import ExperimentLoginWrapper from '../components/experiment/ExperimentLogin';

/**
 * Standalone experiment login page – wraps the normal login UI
 * with the A/B pizza-message experiment overlay.
 *
 * Route: /login-experiment
 */
const LoginExperiment: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
        }}
      >
        <ExperimentLoginWrapper>
          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                color: '#f1f5f9',
                fontSize: '24px',
                fontWeight: 700,
                marginBottom: '8px',
              }}
            >
              Welcome to NetResearch
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
              Visualize your personal research network.
            </p>
            <a
              href="/"
              style={{
                display: 'inline-block',
                backgroundColor: '#6366f1',
                color: '#fff',
                padding: '10px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '15px',
              }}
            >
              Sign in with Google
            </a>
          </div>
        </ExperimentLoginWrapper>
      </div>
    </div>
  );
};

export default LoginExperiment;
