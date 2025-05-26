import { IAthlete, IRecoveryData, IWorkloadData } from '@/lib/types';
import PlayerStat from './playerStat';
import './playerStats.css';
import { useState, useRef, useEffect } from 'react';
import { CrossIcon } from '@/components/Icons/Icons';
import { TickIcon } from '@/components/Icons/Icons';

// Define interface for deviating metric
interface IDeviatingMetric {
  metric: string;
  value: number | null;
  avgValue: number;
  deviation: number;
}

export default function PlayerStats({
  athlete,
  metrics,
  athletes,
  alert,
  deviatingMetrics,
  isCalendar,
  periodString,
  athleteIdsWithSurveySubmission,
  athleteSurveySubmissionCounts
}: {
  athlete: IAthlete,
  metrics: [IRecoveryData[], IWorkloadData[]],
  athletes: IAthlete[],
  alert?: number,
  deviatingMetrics?: IDeviatingMetric[],
  isCalendar?: boolean,
  periodString?: string | string[],
  athleteIdsWithSurveySubmission: { athlete_id: number }[],
  athleteSurveySubmissionCounts: Record<number, { last7Days: number; last30Days: number }>
}) {
  // Add state for the popup
  const [showPopup, setShowPopup] = useState(false);
  // Add state for the fade animation
  const [fadeIn, setFadeIn] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLElement>(null);

  // Format metric name for display
  const formatMetricName = (metricName: string): string => {
    return metricName
      .replace(/_avg$/, '')  // Remove _avg suffix
      .split('_')            // Split by underscore
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter
      .join(' ');            // Join with spaces
  };

  // Format duration values (for sleep metrics)
  const formatDurationValue = (metricName: string, value: number | null): string => {
    // Check if the metric is sleep_duration or restorative_sleep_duration and value exists
    if ((metricName.includes('sleep_duration') || metricName === 'restorative_sleep_duration_avg') && value !== null) {
      // Convert milliseconds to hours and minutes
      const totalMinutes = Math.round(value / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return `${hours}h ${minutes}m`;
    }

    // For non-duration metrics, return the value with 1 decimal place
    return value !== null ? value.toFixed(1) : 'N/A';
  };

  // Format average duration values (for sleep metrics)
  const formatDurationAvg = (metricName: string, value: number): string => {
    // Check if the metric is sleep_duration or restorative_sleep_duration
    if (metricName.includes('sleep_duration') || metricName === 'restorative_sleep_duration_avg') {
      // Convert milliseconds to hours and minutes
      const totalMinutes = Math.round(value / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return `${hours}h ${minutes}m`;
    }

    // For non-duration metrics, return the value with 1 decimal place
    return value.toFixed(1);
  };

  // Handle clicks outside to close the popup
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        iconRef.current &&
        !iconRef.current.contains(event.target as Node)
      ) {
        handleClosePopup();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle popup visibility with animation
  const togglePopup = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (showPopup) {
      handleClosePopup();
    } else {
      setShowPopup(true);
      // Trigger fade-in animation after a tiny delay to ensure DOM has updated
      setTimeout(() => setFadeIn(true), 10);
    }
  };

  // Handle closing popup with animation
  const handleClosePopup = () => {
    setFadeIn(false);
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setShowPopup(false);
    }, 300); // Match this to your animation duration
  };

  // Handle navigation to different routes
  const navigateToPlayerPerformance = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Map full metric names to their abbreviations
    const metricAbbreviations: Record<string, string> = {
      'recovery_score_avg': 'REC',
      'strain_avg': 'STR',
      'rhr_avg': 'RHR',
      'hrv_avg': 'HRV',
      'sleep_performance_avg': 'SP',
      'sleep_consistency_avg': 'SC',
      'sleep_efficiency_avg': 'SE',
      'sleep_duration_avg': 'SD',
      'restorative_sleep_duration_avg': 'RSD',
      'restorative_sleep_avg': 'RS'
    };

    // Get unique metric abbreviations from deviating metrics
    const sleepMetrics: string[] = [];
    const performanceMetrics: string[] = [];

    if (deviatingMetrics && deviatingMetrics.length > 0) {
      deviatingMetrics.forEach(metric => {
        const abbr = metricAbbreviations[metric.metric];
        if (!abbr) return;

        // Categorize metrics into sleep-related and performance-related
        if (['RS', 'SE', 'SP', 'SD', 'SC', 'RSD'].includes(abbr)) {
          if (!sleepMetrics.includes(abbr)) {
            sleepMetrics.push(abbr);
          }
        } else {
          if (!performanceMetrics.includes(abbr)) {
            performanceMetrics.push(abbr);
          }
        }
      });
    }

    // // If no deviating metrics, use default set
    // if (sleepMetrics.length === 0 && performanceMetrics.length === 0) {
    //   window.location.href = `/player-performance/${athlete.athlete_id}?m=RS,SE,SP,SD,SC,RSD|RHR,HRV,REC,STR`;
    //   return;
    // }


    // Construct URL with deviating metrics highlighted
    const metricsParam = `${sleepMetrics.join(',')}|${performanceMetrics.join(',')}`;

    // We don't want to pass the periodString to the player-performance page if it is not for 30 Days

    if (periodString === 'last30Days') {
      window.location.href = `/player-performance/${athlete.athlete_id}?m=${metricsParam}&p=last30Days`;
    } else {
      window.location.href = `/player-performance/${athlete.athlete_id}?m=${metricsParam}`;
    }
  };

  return (
    <div id='player-stats' className='row' onClick={() => window.location.href = `/player/${athlete.athlete_id}`}>
      <i className="col-1 bi bi-person-circle d-flex justify-content-center align-items-center"></i>
      <p className='stat col-3'>{athlete.first_name} {athlete.last_name.charAt(0)}.</p>
      <PlayerStat athlete={athlete} metrics={metrics} athletes={athletes} stat={'recovery'} />
      <PlayerStat athlete={athlete} metrics={metrics} athletes={athletes} stat={'workload'} />
      <div className='stat col-2 d-flex justify-content-center align-items-center'>
        {
          periodString === 'Today' && (
            athleteIdsWithSurveySubmission.some(submission => submission.athlete_id === athlete.athlete_id) ? <TickIcon /> : <CrossIcon />
          )
        }
        {
          periodString === 'last7Days' && (
            <div style={{ display: 'flex', gap: '2px' }} >
              <div>{athleteSurveySubmissionCounts[athlete.athlete_id]?.last7Days ?? 0}</div>
              <div>/</div>
              <div>7</div>
            </div>
          )
        }
        {
          periodString === 'last30Days' && (
            <div style={{ display: 'flex', gap: '2px' }} >
              <div>{athleteSurveySubmissionCounts[athlete.athlete_id]?.last30Days ?? 0}</div>
              <div>/</div>
              <div>30</div>
            </div>
          )
        }
      </div>
      <div className='stat col-2 d-flex justify-content-center align-items-center'>
        {
          alert && !isCalendar ? (
            <div className="position-relative" style={{ overflow: 'visible' }}>
              <i
                ref={iconRef}
                className={`player-alert-icon bi bi-exclamation-triangle-fill d-flex justify-content-center align-items-center ${alert === 1 ? 'moderate' : 'critical'}`}
                onClick={togglePopup}
              ></i>

              {showPopup && (
                <div
                  ref={popupRef}
                  className={`alert-popup position-absolute shadow p-3 rounded ${fadeIn ? 'fade-in' : 'fade-out'}`}
                  style={{
                    zIndex: 9999,
                    left: '140%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 'max-content',
                    height: 'auto',
                    overflow: 'visible',
                    whiteSpace: 'normal',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    backgroundColor: `${alert === 1 ? 'yellow' : 'var(--light-red)'}`,
                  }}
                  onClick={navigateToPlayerPerformance}
                >
                  <div
                    style={{
                      cursor: 'pointer',
                      color: `${alert === 1 ? 'black' : 'white'}`,
                      fontSize: '0.8rem'
                    }}
                  >
                    {deviatingMetrics && deviatingMetrics.length > 0 ? (
                      <>
                        <p className="mb-1 fw-bold">Deviating Metrics:</p>
                        <ul className="ps-3 mb-0">
                          {deviatingMetrics.map((metric, index) => (
                            <li key={index}>
                              {formatMetricName(metric.metric)}: {formatDurationValue(metric.metric, metric.value)}
                              {' '}
                              <span className="fst-italic">
                                (avg: {formatDurationAvg(metric.metric, metric.avgValue)})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="mb-0 small">
                        {alert === 1
                          ? 'The metric has a small deviation.'
                          : 'The metric has a large deviation.'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : undefined
        }
      </div>
    </div>
  )
} 
