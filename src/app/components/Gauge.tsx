'use client';

import { GaugeProps } from '@/lib/types';
import { GaugeComponent } from 'react-gauge-component';

export default function Gauge({ value, maxValue, subArcs }: GaugeProps) {
  return (
    <div className='chart'>
      <GaugeComponent 
        key={value}
        arc={{
          subArcs: subArcs
        }}
        labels={{
          valueLabel: {
            formatTextValue: () => value || '0'
          },
        }}
        value={parseInt(value) || 0}
        maxValue={maxValue}
      />
    </div>
  );
} 