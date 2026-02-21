import { useEffect } from 'react';
import ControlVariant from './control/index';
import PizzaVariant from './pizza/index';

// 30% control (segment 7), 70% pizza (segment 8)
function getSegment(): 'control' | 'pizza' {
  const stored = sessionStorage.getItem('exp4_segment');
  if (stored === 'control' || stored === 'pizza') return stored;
  const segment = Math.random() < 0.3 ? 'control' : 'pizza';
  sessionStorage.setItem('exp4_segment', segment);
  return segment;
}

export default function PizzaMessageExperiment() {
  const segment = getSegment();

  useEffect(() => {}, []);

  if (segment === 'pizza') return <PizzaVariant />;
  return <ControlVariant />;
}
