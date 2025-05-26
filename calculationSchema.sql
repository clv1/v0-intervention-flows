-- Individual Athlete Calculations
CREATE TABLE athlete_recovery_calculations (
    athlete_id INTEGER PRIMARY KEY REFERENCES athlete(athlete_id),
    daily_score DECIMAL(4,1),
    seven_day_average DECIMAL(4,1),
    thirty_day_average DECIMAL(4,1),
    previous_day_score DECIMAL(4,1),
    previous_seven_day_average DECIMAL(4,1),
    previous_thirty_day_average DECIMAL(4,1),
    daily_difference DECIMAL(4,1),
    seven_day_difference DECIMAL(4,1),
    thirty_day_difference DECIMAL(4,1)
);

CREATE TABLE athlete_workload_calculations (
    athlete_id INTEGER PRIMARY KEY REFERENCES athlete(athlete_id),
    daily_score DECIMAL(4,1),
    seven_day_average DECIMAL(4,1),
    thirty_day_average DECIMAL(4,1),
    previous_day_score DECIMAL(4,1),
    previous_seven_day_average DECIMAL(4,1),
    previous_thirty_day_average DECIMAL(4,1),
    daily_difference DECIMAL(4,1),
    seven_day_difference DECIMAL(4,1),
    thirty_day_difference DECIMAL(4,1)
);

CREATE TABLE athlete_fitness_calculations (
    athlete_id INTEGER PRIMARY KEY REFERENCES athlete(athlete_id),
    daily_score DECIMAL(4,1),
    seven_day_average DECIMAL(4,1),
    thirty_day_average DECIMAL(4,1),
    previous_day_score DECIMAL(4,1),
    previous_seven_day_average DECIMAL(4,1),
    previous_thirty_day_average DECIMAL(4,1),
    daily_difference DECIMAL(4,1),
    seven_day_difference DECIMAL(4,1),
    thirty_day_difference DECIMAL(4,1)
);

-- Squad Averages
CREATE TABLE squad_recovery_calculations (
    squad_id INTEGER PRIMARY KEY REFERENCES squad(squad_id),
    daily_average DECIMAL(4,1),
    seven_day_average DECIMAL(4,1),
    thirty_day_average DECIMAL(4,1),
    previous_day_average DECIMAL(4,1),
    previous_seven_day_average DECIMAL(4,1),
    previous_thirty_day_average DECIMAL(4,1),
    daily_difference DECIMAL(4,1),
    seven_day_difference DECIMAL(4,1),
    thirty_day_difference DECIMAL(4,1)
);

CREATE TABLE squad_workload_calculations (
    squad_id INTEGER PRIMARY KEY REFERENCES squad(squad_id),
    daily_average DECIMAL(4,1),
    seven_day_average DECIMAL(4,1),
    thirty_day_average DECIMAL(4,1),
    previous_day_average DECIMAL(4,1),
    previous_seven_day_average DECIMAL(4,1),
    previous_thirty_day_average DECIMAL(4,1),
    daily_difference DECIMAL(4,1),
    seven_day_difference DECIMAL(4,1),
    thirty_day_difference DECIMAL(4,1)
);

CREATE TABLE squad_fitness_calculations (
    squad_id INTEGER PRIMARY KEY REFERENCES squad(squad_id),
    daily_average DECIMAL(4,1),
    seven_day_average DECIMAL(4,1),
    thirty_day_average DECIMAL(4,1),
    previous_day_average DECIMAL(4,1),
    previous_seven_day_average DECIMAL(4,1),
    previous_thirty_day_average DECIMAL(4,1),
    daily_difference DECIMAL(4,1),
    seven_day_difference DECIMAL(4,1),
    thirty_day_difference DECIMAL(4,1)
);



-- Drop existing tables if they exist
DROP TABLE IF EXISTS athlete_daily_metrics CASCADE;
DROP TABLE IF EXISTS squad_daily_metrics CASCADE;

-- Individual athlete daily metrics
CREATE TABLE athlete_daily_metrics (
    athlete_id INTEGER REFERENCES athlete(athlete_id),
    date DATE NOT NULL,
    recovery_score DECIMAL(4,1),
    strain_score DECIMAL(4,1),
    rhr_score INTEGER,
    hrv_score DECIMAL(4,1),
    sleep_performance_score DECIMAL(4,1),
    sleep_consistency_score DECIMAL(4,1),
    sleep_efficiency_score DECIMAL(4,1),
    sleep_duration_hours DECIMAL(4,1),
    restorative_sleep_duration_hours DECIMAL(4,1),
    restorative_sleep_score DECIMAL(4,1),
    PRIMARY KEY (athlete_id, date)
);

-- Squad daily averages
CREATE TABLE squad_daily_metrics (
    squad_id INTEGER REFERENCES squad(squad_id),
    date DATE NOT NULL,
    recovery_score DECIMAL(4,1),
    strain_score DECIMAL(4,1),
    rhr_score INTEGER,
    hrv_score DECIMAL(4,1),
    sleep_performance_score DECIMAL(4,1),
    sleep_consistency_score DECIMAL(4,1),
    sleep_efficiency_score DECIMAL(4,1),
    sleep_duration_hours DECIMAL(4,1),
    restorative_sleep_duration_hours DECIMAL(4,1),
    restorative_sleep_score DECIMAL(4,1),
    athletes_reported INTEGER,
    total_athletes INTEGER,
    PRIMARY KEY (squad_id, date)
);

-- Create indexes for performance
CREATE INDEX idx_athlete_daily_recent ON athlete_daily_metrics(athlete_id, date DESC);
CREATE INDEX idx_squad_daily_recent ON squad_daily_metrics(squad_id, date DESC);

-- Alert System Schema
CREATE TABLE calculations_schema.alert_system (
    hrv_std_dev double precision,
    sleep_performance_avg double precision,
    sleep_performance_std_dev double precision,
    sleep_consistency_avg double precision,
    sleep_consistency_std_dev double precision,
    sleep_efficiency_avg double precision,
    sleep_efficiency_std_dev double precision,
    sleep_duration_avg double precision,
    sleep_duration_std_dev double precision,
    restorative_sleep_duration_avg double precision,
    restorative_sleep_duration_std_dev double precision,
    restorative_sleep_avg double precision,
    restorative_sleep_std_dev double precision,
    athlete_id integer,
    recovery_score_avg double precision,
    recovery_score_std_dev double precision,
    strain_avg double precision,
    strain_std_dev double precision,
    rhr_avg double precision,
    rhr_std_dev double precision,
    hrv_avg double precision
);

-- All Time Metrics Schema
CREATE TABLE calculations_schema.all_time_metrics (
    athlete_id integer,
    strain integer,
    rhr integer,
    hrv integer,
    sleep_performance integer,
    sleep_consistency integer,
    sleep_efficiency integer,
    sleep_duration integer,
    restorative_sleep_duration integer,
    restorative_sleep integer,
    sleep_start timestamp with time zone,
    recovery_score integer,
    label timestamp with time zone,
    sleep_end timestamp with time zone
);

CREATE TABLE calculations_schema.all_time_metrics_averages (
    sleep_duration_avg numeric,
    athlete_id integer,
    recovery_score_avg numeric,
    strain_avg numeric,
    rhr_avg numeric,
    hrv_avg numeric,
    sleep_performance_avg numeric,
    sleep_consistency_avg numeric,
    sleep_efficiency_avg numeric,
    restorative_sleep_duration_avg numeric,
    restorative_sleep_avg numeric
);

-- Line Chart Metrics Schema
CREATE TABLE calculations_schema.homepage_line_chart_metrics (
    label text,
    time_window text,
    workload integer,
    recovery integer
);

CREATE TABLE calculations_schema.performance_line_chart_metrics (
    label text,
    time_window text,
    athlete_id integer,
    recovery_score integer,
    strain integer,
    rhr integer,
    hrv integer,
    sleep_performance integer,
    sleep_consistency integer,
    sleep_efficiency integer,
    sleep_duration numeric,
    restorative_sleep_duration numeric,
    restorative_sleep integer,
    sleep_start timestamp with time zone,
    sleep_end timestamp with time zone
);

CREATE TABLE calculations_schema.player_line_chart_metrics (
    workload integer,
    time_window text,
    label text,
    athlete_id integer,
    recovery integer
);

-- Recovery and Workload Metrics Schema
CREATE TABLE calculations_schema.recovery_metrics (
    athlete_id integer,
    period text,
    value integer
);

CREATE TABLE calculations_schema.recovery_metrics_average (
    average integer,
    period text
);

CREATE TABLE calculations_schema.recovery_squad_availability (
    period text,
    value integer,
    athlete_id integer
);

CREATE TABLE calculations_schema.workload_metrics (
    athlete_id integer,
    value integer,
    period text
);

CREATE TABLE calculations_schema.workload_metrics_average (
    period text,
    average integer
);

-- Create indexes for new tables
CREATE INDEX idx_alert_system_athlete ON calculations_schema.alert_system(athlete_id);
CREATE INDEX idx_all_time_metrics_athlete ON calculations_schema.all_time_metrics(athlete_id);
CREATE INDEX idx_all_time_metrics_averages_athlete ON calculations_schema.all_time_metrics_averages(athlete_id);
CREATE INDEX idx_performance_line_chart_athlete ON calculations_schema.performance_line_chart_metrics(athlete_id);
CREATE INDEX idx_player_line_chart_athlete ON calculations_schema.player_line_chart_metrics(athlete_id);
CREATE INDEX idx_recovery_metrics_athlete ON calculations_schema.recovery_metrics(athlete_id);
CREATE INDEX idx_recovery_squad_availability_athlete ON calculations_schema.recovery_squad_availability(athlete_id);
CREATE INDEX idx_workload_metrics_athlete ON calculations_schema.workload_metrics(athlete_id);