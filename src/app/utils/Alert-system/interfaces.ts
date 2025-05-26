// Define interface for player metrics
export interface IPlayerMetrics {
  recovery_score_avg: number | null;
  strain_avg: number | null;
  rhr_avg: number | null;
  hrv_avg: number | null;
  sleep_performance_avg: number | null;
  sleep_consistency_avg: number | null;
  sleep_efficiency_avg: number | null;
  sleep_duration_avg: number | null;
  restorative_sleep_duration_avg: number | null;
  restorative_sleep_avg: number | null;
}

// Define interface for deviating metric
export interface IDeviatingMetric {
  metric: string;
  value: number | null;
  avgValue: number;
  deviation: number;
}

// Define interface for player alerts
export interface IPlayerAlert {
  athlete_id: number;
  alert: number;
  deviatingMetrics: IDeviatingMetric[];
}

// Define interface for period alerts structure
export interface IPeriodAlerts {
  Today: IPlayerAlert[];
  last7Days: IPlayerAlert[];
  last30Days: IPlayerAlert[];
}

// Define interface for period data structure
export interface IPeriodData {
  Today: { [athleteId: number]: IPlayerMetrics };
  last7Days: { [athleteId: number]: IPlayerMetrics };
  last30Days: { [athleteId: number]: IPlayerMetrics };
}

// Define interface for filtered alert system values
export interface IFilteredAlertSystem {
  athlete_id: number;
  team_id: number;
  hrv_three_month_avg?: number;
  hrv_three_month_std_dev?: number;
  recovery_score_three_month_avg?: number;
  recovery_score_three_month_std_dev?: number;
  restorative_sleep_three_month_avg?: number;
  restorative_sleep_three_month_std_dev?: number;
  restorative_sleep_duration_three_month_avg?: number;
  restorative_sleep_duration_three_month_std_dev?: number;
  rhr_three_month_avg?: number;
  rhr_three_month_std_dev?: number;
  sleep_consistency_three_month_avg?: number;
  sleep_consistency_three_month_std_dev?: number;
  sleep_duration_three_month_avg?: number;
  sleep_duration_three_month_std_dev?: number;
  sleep_efficiency_three_month_avg?: number;
  sleep_efficiency_three_month_std_dev?: number;
  sleep_performance_three_month_avg?: number;
  sleep_performance_three_month_std_dev?: number;
  strain_three_month_avg?: number;
  strain_three_month_std_dev?: number;
  hrv_all_time_avg?: number;
  hrv_all_time_std_dev?: number;
  recovery_score_all_time_avg?: number;
  recovery_score_all_time_std_dev?: number;
  restorative_sleep_all_time_avg?: number;
  restorative_sleep_all_time_std_dev?: number;
  restorative_sleep_duration_all_time_avg?: number;
  restorative_sleep_duration_all_time_std_dev?: number;
  rhr_all_time_avg?: number;
  rhr_all_time_std_dev?: number;
  sleep_consistency_all_time_avg?: number;
  sleep_consistency_all_time_std_dev?: number;
  sleep_duration_all_time_avg?: number;
  sleep_duration_all_time_std_dev?: number;
  sleep_efficiency_all_time_avg?: number;
  sleep_efficiency_all_time_std_dev?: number;
  sleep_performance_all_time_avg?: number;
  sleep_performance_all_time_std_dev?: number;
  strain_all_time_avg?: number;
  strain_all_time_std_dev?: number;
}
