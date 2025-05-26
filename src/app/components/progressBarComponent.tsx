'use client';

import './progressBarComponent.css';

interface ProgressBarProps {
  name: string;
  value: number;
  limits: {
    min: number;
    max: number;
  };
  valueLabel?: boolean;
}

export default function ProgressBarComponent({ name, value, limits, valueLabel = false }: ProgressBarProps) {
  const leftValue = value < 0 ? Math.abs(value) : 0;


  const rightValue = value > 0 ? value : 0;

  return (
    <div id="progress-bar-component" className="d-flex flex-column gap-2">
      <div className="d-flex flex-row justify-content-center align-items-center gap-4">
        <p className="progress-bar-label">{name}</p>
        {valueLabel && (
          <p className={`progress-bar-value ${value > 0 ? 'positive' : 'negative'}`}>
            {value > 0 ? `+${value}` : value}%
          </p>
        )}

      </div>
      <div className="progress-container">
        <div className="progress left-bar">
          <div 
            className="progress-bar" 
            role="progressbar"
            style={{ width: `${(leftValue/Math.abs(limits.min)) * 100}%` }}
          />
        </div>
        <div className="progress right-bar">
          <div 
            className="progress-bar" 
            role="progressbar"
            style={{ width: `${(rightValue/limits.max) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}