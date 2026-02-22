import { useEffect, useState } from 'react';
import ControlVariant from './ControlVariant';
import CroissantVariant from './CroissantVariant';

const SEGMENTS = [
  { id: 11, name: 'control', percentage: 0.5, preview_hash: 'GcSUTIIC9uc' },
  { id: 12, name: 'variant-croissant', percentage: 0.5, preview_hash: '-IpKd6Ul7II' },
];

function assignSegment(): typeof SEGMENTS[number] {
  const urlHash = new URLSearchParams(window.location.search).get('x');
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
  return SEGMENTS[SEGMENTS.length - 1];
}

export default function ExperimentRouter() {
  const [segment] = useState(() => assignSegment());

  if (segment.name === 'variant-croissant') {
    return <CroissantVariant />;
  }
  return <ControlVariant />;
}
