import React, { useEffect, useRef } from 'react';

const EXPERIMENT_ID = 8;
const PROJECT_ID = 7;

const SEGMENTS = [
  { id: 15, name: 'A', preview_hash: 'sO4nkBIl-oA', percentage: 0.5 },
  { id: 16, name: 'B', preview_hash: 'mz8tIamVrOs', percentage: 0.5 },
];

function getSegment() {
  if (typeof window !== 'undefined') {
    const urlHash = new URLSearchParams(window.location.search).get('x');
    if (urlHash) {
      const forced = SEGMENTS.find((s) => s.preview_hash === urlHash);
      if (forced) return forced;
    }
  }

  const stored = sessionStorage.getItem('btn_color_exp_segment');
  if (stored) {
    const parsed = JSON.parse(stored);
    const found = SEGMENTS.find((s) => s.id === parsed.id);
    if (found) return found;
  }

  const rand = Math.random();
  const selected = rand < 0.5 ? SEGMENTS[0] : SEGMENTS[1];
  sessionStorage.setItem('btn_color_exp_segment', JSON.stringify(selected));
  return selected;
}

function trackEvent(eventId: string, segmentId: number, segmentName: string, userId?: string) {
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

interface ButtonColorExperimentProps {
  onSignIn: () => void;
  isLoading?: boolean;
  label?: string;
}

export function ButtonColorExperiment({ onSignIn, isLoading, label = 'Sign in with Google' }: ButtonColorExperimentProps) {
  const segment = getSegment();
  const viewTracked = useRef(false);

  useEffect(() => {
    if (!viewTracked.current) {
      viewTracked.current = true;
      trackEvent('signin_view', segment.id, segment.name);
    }
  }, [segment.id, segment.name]);

  const handleClick = () => {
    trackEvent('signin_attempt', segment.id, segment.name);
    onSignIn();
  };

  const isVariantB = segment.id === 16;

  const baseClasses =
    'flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const colorClasses = isVariantB
    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400'
    : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-400';

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${baseClasses} ${colorClasses}`}
      data-experiment={EXPERIMENT_ID}
      data-segment={segment.id}
    >
      {label}
    </button>
  );
}

export function trackSignInSuccess(userId?: string) {
  const stored = sessionStorage.getItem('btn_color_exp_segment');
  if (!stored) return;
  try {
    const segment = JSON.parse(stored);
    if (segment && segment.id && segment.name) {
      trackEvent('signin_success', segment.id, segment.name, userId);
    }
  } catch (_) {}
}

export { getSegment };
