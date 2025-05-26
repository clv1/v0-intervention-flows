'use client';

import { useEffect, useState } from 'react';
import Gauge from '@/components/Gauge';
import './summaryIndicator.css';
import { IWorkloadAverageData } from '@/lib/types';
import { IRecoveryAverageData } from '@/lib/types';

/**
 * SummaryIndicator Component
 * Displays a gauge chart showing metrics for Recovery, Strain, or Fitness Score
 * Also shows the change in metrics compared to previous period
 */
export const strainConfig = {
  maxValue: 21,
  subArcs: [
    { limit: 5, color: '#EA4228', showTick: false },
    { limit: 10, color: '#F58B19', showTick: false },
    { limit: 15, color: '#F5CD19', showTick: false },
    { limit: 21, color: '#5BE12C', showTick: false },
  ]
};

export const recoveryConfig = {
  maxValue: 100,
  subArcs: [
    { limit: 20, color: '#EA4228', showTick: false },
    { limit: 40, color: '#F58B19', showTick: false },
    { limit: 60, color: '#F5CD19', showTick: false },
    { limit: 100, color: '#5BE12C', showTick: false },
  ]
};

export default function SummaryIndicator({ title, metric, metricDifference, squadRecoveryPercent, squadRecoveryDifferencePercent, playerPagePeriod }: { title: string, metric: number | undefined, metricDifference: number | undefined, squadRecoveryPercent: number, squadRecoveryDifferencePercent: number, playerPagePeriod?: string | string[] }) {
  const [changeStr, setChangeStr] = useState<string>('0');
  const [gaugeValue, setGaugeValue] = useState<string>('0');
  const [shouldRenderGauge, setShouldRenderGauge] = useState(false);

  const config = title === 'Strain' ? strainConfig : recoveryConfig;

  // Calculate and update changes when props update
  useEffect(() => {
    // Format change string (add % for non-strain metrics)
    setChangeStr(
      title !== 'Strain' ? metricDifference?.toString().concat('%') ?? 'N/A' : metricDifference?.toString() ?? 'N/A'
    );

    if (title === 'Squad Availability') {
      setGaugeValue(`${squadRecoveryPercent}`);
      setChangeStr(`${squadRecoveryDifferencePercent}`);
    } else if (title === 'Strain') {
      if (metric === 0 || metric === undefined) {
        setGaugeValue('N/A');
        setChangeStr('N/A');
      } else {
        setGaugeValue(metric.toString());
      }
    } else if (title == 'Recovery Score') {
      if (metric === 0 || metric === undefined) {
        setGaugeValue('N/A');
        setChangeStr('N/A');
      } else {
        setGaugeValue(metric.toString());
      }
    }
    setShouldRenderGauge(true);
  }, [
    title,
    metric,
    metricDifference,
    squadRecoveryPercent,
    squadRecoveryDifferencePercent
  ]);

  return (
    <div id='summary-indicator' className='d-flex gap-0 justify-content-center align-items-center'>
      <div className='d-flex'>
        <div className='d-flex align-items-center justify-content-center'>
          <p className='d-flex justify-content-center align-items-center'>
            {playerPagePeriod && title === 'Squad Availability' ? 'Availability' : title}
          </p>
        </div>

        {playerPagePeriod === 'today' ? (
          <div className='d-flex align-items-center justify-content-center'>
            {squadRecoveryPercent === 100 ? (
              <p className='squad-availability-value-yes'>YES</p>
            ) : (
              <p className='squad-availability-value-no'>NO</p>
            )}

          </div>
        ) : (
          <div id='graph' className='d-flex align-items-center'>
            {/* Gauge Components */}
            {shouldRenderGauge && (
              <Gauge
                value={gaugeValue}
                maxValue={config.maxValue}
                subArcs={config.subArcs}
              />
            )}

            {/* Change Indicator */}
            <div className='change'>
              <div className={`
              d-flex change-stat gap-1
              ${metricDifference && metricDifference < 0 || squadRecoveryDifferencePercent < 0
                  ? 'down'
                  : metricDifference && metricDifference > 0 || squadRecoveryDifferencePercent > 0
                    ? 'up'
                    : undefined
                }
            `}>
                {/* Show appropriate arrow icon based on change direction */}
                {metricDifference && metricDifference < 0 || squadRecoveryDifferencePercent < 0 ? (
                  <i className="bi bi-caret-down-fill"></i>
                ) : (
                  <i className="bi bi-caret-up-fill"></i>
                )}

                {/* Display change value */}
                {changeStr}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
