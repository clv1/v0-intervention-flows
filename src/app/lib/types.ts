export interface IPlayer {
  id: number;
  name: string;
  recovery: number;
  workload: number;
  fitness: number;
  survey: string;
  alerts: boolean;
}

export interface IAthlete {
  athlete_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
}

export interface IAthleteMetrics {
  athlete_id: number;
  height_meter: number;
  weight_kilogram: number;
  date: Date;
}

export interface IRecovery {
  recovery_id: number;
  cycle_id: number;
  athlete_id: number;
  score_state: string;
  sleep_id: number;
}

export interface IRecoveryMetrics {
  recovery_id: number;
  recovery_score: number;
  hrv_rmssd_milli: number;
  resting_heart_rate: number;
}

export interface IRecoveryData {
  athlete_id: number;
  period: string;
  value: number | null;
}

export interface IWorkloadMetrics {
  athlete_id: number;
  period: string;
  value: number | null;
}

export interface IRecoveryAverageData {
  period: string;
  average: number | null;
}

export interface IWorkloadData {
  athlete_id: number;
  period: string;
  value: number | null;
}

export interface IWorkloadAverageData {
  period: string;
  average: number | null;
}

export interface IPlayerLineChartData {
  athlete_id: number;
  time_window: string;
  label: string;
  recovery: number | null;
  workload: number | null;
}

export interface IPerformanceLineChartData {
  athlete_id: number;
  time_window: string;
  label: string;
  recovery_score: number | null;
  strain: number | null;
  rhr: number | null;
  hrv: number | null;
  sleep_performance: number | null;
  sleep_consistency: number | null;
  sleep_efficiency: number | null;
  sleep_duration: number | null;
  restorative_sleep_duration: number | null;
  restorative_sleep: number | null;
  sleep_start: string | null;
  sleep_end: string | null;
}

export interface IAllTimeMetrics {
  athlete_id: number;
  label: string;
  recovery_score: number | null;
  strain: number | null;
  rhr: number | null;
  hrv: number | null;
  sleep_performance: number | null;
  sleep_consistency: number | null;
  sleep_efficiency: number | null;
  sleep_duration: number | null;
  restorative_sleep_duration: number | null;
  restorative_sleep: number | null;
}

export interface IAllTimeMetricsAverages {
  athlete_id: number;
  recovery_score_avg: number;
  strain_avg: number;
  rhr_avg: number;
  hrv_avg: number;
  sleep_performance_avg: number;
  sleep_consistency_avg: number;
  sleep_efficiency_avg: number;
  sleep_duration_avg: number;
  restorative_sleep_duration_avg: number;
  restorative_sleep_avg: number;
}

export interface ICycle {
  cycle_id: number;
  athlete_id: number;
  cycle_date: string;
}

export interface ICycleMetrics {
  cycle_id: number;
  strain: number;
}

export interface ISleep {
  sleep_id: number;
  sleep_start: string;
  sleep_end: string;
}

export interface ISleepPerformance {
  sleep_id: number;
  sleep_performance_percentage: number;
  sleep_consistency_percentage: number;
  sleep_efficiency_percentage: number;
}

export interface ISleepStages {
  sleep_id: number;
  total_in_bed_time_milli: number;
  total_awake_time_milli: number;
  total_slow_wave_sleep_time_milli: number;
  total_rem_sleep_time_milli: number;
}

export interface IPLayerStats {
  athlete_id: number;
  recovery_score: number[];
  workload_score: number[];
}

export interface DateRange {
  start: string; // ISO format: "YYYY-MM-DD"
  end: string; // ISO format: "YYYY-MM-DD"
}

export interface GaugeProps {
  value: string;
  maxValue: number;
  subArcs: SubArc[];
}

export interface SubArc {
  limit: number;
  color: string;
  showTick: boolean;
}

export interface User {
  supabase_auth_uid?: string;
  user_info_id?: number;
  role?: string;
}

export interface UserInfo {
  user_info_id?: number;
  user_info_version?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string; // ISO format: "YYYY-MM-DD"
}

export interface UserTeam {
  user_team_id?: number;
  supabase_auth_uid?: string;
  team_id?: number;
}

export interface RecoverySquadAvailability {
  athlete_id: number;
  period: 'today' | 'previousDay' | 'last7Days' | 'previous7Days' | 'last30Days' | 'previous30Days';
  value: number;
}

export interface IAlertSystem {
  athlete_id: number;
  team_id: number;
  // Three month metrics
  hrv_three_month_avg: number;
  hrv_three_month_std_dev: number;
  recovery_score_three_month_avg: number;
  recovery_score_three_month_std_dev: number;
  restorative_sleep_three_month_avg: number;
  restorative_sleep_three_month_std_dev: number;
  restorative_sleep_duration_three_month_avg: number;
  restorative_sleep_duration_three_month_std_dev: number;
  rhr_three_month_avg: number;
  rhr_three_month_std_dev: number;
  sleep_consistency_three_month_avg: number;
  sleep_consistency_three_month_std_dev: number;
  sleep_duration_three_month_avg: number;
  sleep_duration_three_month_std_dev: number;
  sleep_efficiency_three_month_avg: number;
  sleep_efficiency_three_month_std_dev: number;
  sleep_performance_three_month_avg: number;
  sleep_performance_three_month_std_dev: number;
  strain_three_month_avg: number;
  strain_three_month_std_dev: number;
  // All time metrics
  hrv_all_time_avg: number;
  hrv_all_time_std_dev: number;
  recovery_score_all_time_avg: number;
  recovery_score_all_time_std_dev: number;
  restorative_sleep_all_time_avg: number;
  restorative_sleep_all_time_std_dev: number;
  restorative_sleep_duration_all_time_avg: number;
  restorative_sleep_duration_all_time_std_dev: number;
  rhr_all_time_avg: number;
  rhr_all_time_std_dev: number;
  sleep_consistency_all_time_avg: number;
  sleep_consistency_all_time_std_dev: number;
  sleep_duration_all_time_avg: number;
  sleep_duration_all_time_std_dev: number;
  sleep_efficiency_all_time_avg: number;
  sleep_efficiency_all_time_std_dev: number;
  sleep_performance_all_time_avg: number;
  sleep_performance_all_time_std_dev: number;
  strain_all_time_avg: number;
  strain_all_time_std_dev: number;
}

export interface IAlertSystem {
  athlete_id: number;
  team_id: number;
  recovery_score_avg: number;
  recovery_score_std_dev: number;
  strain_avg: number;
  strain_std_dev: number;
  rhr_avg: number;
  rhr_std_dev: number;
  hrv_avg: number;
  hrv_std_dev: number;
  sleep_performance_avg: number;
  sleep_performance_std_dev: number;
  sleep_consistency_avg: number;
  sleep_consistency_std_dev: number;
  sleep_efficiency_avg: number;
  sleep_efficiency_std_dev: number;
  sleep_duration_avg: number;
  sleep_duration_std_dev: number;
  restorative_sleep_duration_avg: number;
  restorative_sleep_duration_std_dev: number;
  restorative_sleep_avg: number;
  restorative_sleep_std_dev: number;
  // Three month metrics
  hrv_three_month_avg: number;
  hrv_three_month_std_dev: number;
  recovery_score_three_month_avg: number;
  recovery_score_three_month_std_dev: number;
  restorative_sleep_three_month_avg: number;
  restorative_sleep_three_month_std_dev: number;
  restorative_sleep_duration_three_month_avg: number;
  restorative_sleep_duration_three_month_std_dev: number;
  rhr_three_month_avg: number;
  rhr_three_month_std_dev: number;
  sleep_consistency_three_month_avg: number;
  sleep_consistency_three_month_std_dev: number;
  sleep_duration_three_month_avg: number;
  sleep_duration_three_month_std_dev: number;
  sleep_efficiency_three_month_avg: number;
  sleep_efficiency_three_month_std_dev: number;
  sleep_performance_three_month_avg: number;
  sleep_performance_three_month_std_dev: number;
  strain_three_month_avg: number;
  strain_three_month_std_dev: number;
  // All time metrics
  hrv_all_time_avg: number;
  hrv_all_time_std_dev: number;
  recovery_score_all_time_avg: number;
  recovery_score_all_time_std_dev: number;
  restorative_sleep_all_time_avg: number;
  restorative_sleep_all_time_std_dev: number;
  restorative_sleep_duration_all_time_avg: number;
  restorative_sleep_duration_all_time_std_dev: number;
  rhr_all_time_avg: number;
  rhr_all_time_std_dev: number;
  sleep_consistency_all_time_avg: number;
  sleep_consistency_all_time_std_dev: number;
  sleep_duration_all_time_avg: number;
  sleep_duration_all_time_std_dev: number;
  sleep_efficiency_all_time_avg: number;
  sleep_efficiency_all_time_std_dev: number;
  sleep_performance_all_time_avg: number;
  sleep_performance_all_time_std_dev: number;
  strain_all_time_avg: number;
  strain_all_time_std_dev: number;
}

export type EventType = 'recovery' | 'match' | 'training' | 'travel' | 'hotel' | 'rest';

export interface Location {
  venue?: string;
  city: string;
  country: string;
}

export interface Player {
  id: number;
  name: string;
  position: string;
}

export interface Event {
  type: 'Travel' | 'Hotel' | 'Rest Day' | 'Recovery' | 'Training';
  date: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  type: EventType;
  startTime: Date;
  endTime: Date;
  forTeam: boolean;
  players: string[]; // Player IDs
  notes?: string;
  recurring: boolean;
  recurrencePattern?: string;

  // Match specific fields
  opponent?: string;
  location?: Location;

  // Travel specific fields
  fromLocation?: Location;
  toLocation?: Location;
  transportType?: 'flight' | 'bus' | 'train' | 'car';

  // Hotel specific fields
  hotelName?: string;
  hotelLocation?: Location;

  // Recovery specific fields
  therapyType?: string;

  // Training specific fields
  trainingType?: 'tactical' | 'physical' | 'technical';
  venue?: Location;

  // GPS data for match and training
  gpsFile?: {
    name: string;
    url: string;
  };
}

export interface CalendarViewProps {
  currentDate: Date;
  events: ScheduleEvent[];
  onEventClick: (event: ScheduleEvent) => void;
  onTimeSlotClick: (date: Date) => void;
  players: Array<{
    id: number;
    name: string;
  }>;
}

export interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event?: ScheduleEvent;
  onSubmit: (event: Omit<ScheduleEvent, 'id'>) => void;
  initialDate?: Date;
  isCreatingEvent?: boolean;
}

export interface ITeamMentalState {
  team_id: number;
  motivation: number;
  feeling_in_control: number;
  social_fulfillment: number;
  anxiety: number;
  feeling_sick: number;
  positive_anticipation: number;
  gratitude: number;
  sense_of_purpose: number;
  learning: number;
  progress_on_goal: number;
}

export interface IAthleteMentalState {
  athlete_id: number;
  motivation: number;
  feeling_in_control: number;
  social_fulfillment: number;
  anxiety: number;
  feeling_sick: number;
  positive_anticipation: number;
  gratitude: number;
  sense_of_purpose: number;
  learning: number;
  progress_on_goal: number;
}
