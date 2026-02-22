import React, { useEffect, useCallback } from 'react';

const EXPERIMENT_ID = 9;
const PROJECT_ID = 7;

const SEGMENTS = [
  { id: 17, name: 'control', preview_hash: '4qhGRNf5oZo', percentage: 0.5 },
  { id: 18, name: 'variant-blue', preview_hash: '0VkMlv7S4ds', percentage: 0.5 },
];

function getSegment() {
  const urlHash =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('x')
      : null;

  if (urlHash) {
    const forced = SEGMENTS.find((s) => s.preview_hash === urlHash);
    if (forced) return forced;
  }

  const rand = Math.random();
  let cumulative = 0;
  for (const seg of SEGMENTS) {
    cumulative += seg.percentage;
    if (rand < cumulative) return seg;
  }
  return SEGMENTS[0];
}

function trackEvent(
  eventId: string,
  segmentId: number,
  segmentName: string,
  userId?: string
) {
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
      user_id: userId ?? undefined,
      metadata: {},
    }),
  }).catch(() => {});
}

interface SignInButtonColorRetestProps {
  onSignIn?: () => Promise<void> | void;
  userId?: string;
  className?: string;
}

const SignInButtonColorRetest: React.FC<SignInButtonColorRetestProps> = ({
  onSignIn,
  userId,
  className = '',
}) => {
  const segment = React.useMemo(() => getSegment(), []);

  useEffect(() => {
    trackEvent('signin_view', segment.id, segment.name, userId);
  }, [segment, userId]);

  const handleClick = useCallback(async () => {
    try {
      if (onSignIn) {
        await onSignIn();
      }
      trackEvent('signin_success', segment.id, segment.name, userId);
    } catch (err) {
      // sign-in failed — do not fire signin_success
    }
  }, [onSignIn, segment, userId]);

  const isBlue = segment.name === 'variant-blue';

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 24px',
    fontSize: '16px',
    fontWeight: 600,
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    color: '#ffffff',
    backgroundColor: isBlue ? '#2563eb' : '#16a34a',
    transition: 'background-color 0.2s',
  };

  return (
    <button
      style={baseStyle}
      className={className}
      onClick={handleClick}
      data-experiment={EXPERIMENT_ID}
      data-segment={segment.name}
    >
      Sign In
    </button>
  );
};

export default SignInButtonColorRetest;
