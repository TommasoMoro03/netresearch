import React from 'react';
import SignInButtonColorRetest from '../../components/experiment/SignInButtonColorRetest';

const SignInColorRetestPage: React.FC = () => {
  const handleSignIn = async () => {
    // Placeholder: integrate real auth flow here if needed.
    // For preview/QA purposes this simulates a successful sign-in.
    await new Promise<void>((resolve) => setTimeout(resolve, 500));
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        fontFamily: 'sans-serif',
        background: '#f9fafb',
      }}
    >
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
        Sign In to NetResearch
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '8px' }}>
        Experiment: Sign-In Button Color Retest
      </p>
      <SignInButtonColorRetest onSignIn={handleSignIn} />
    </div>
  );
};

export default SignInColorRetestPage;
