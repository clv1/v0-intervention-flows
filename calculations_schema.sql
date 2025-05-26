CREATE TABLE calculations_schema.alert_system (
  athlete_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  hrv_avg NUMERIC(10,2) NOT NULL,
  hrv_std_dev NUMERIC(10,2) NOT NULL,
  sleep_performance_avg NUMERIC(10,2) NOT NULL,
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
  recovery_score_avg double precision,
  recovery_score_std_dev double precision,
  strain_avg double precision,
  strain_std_dev double precision,
  rhr_avg double precision,
  rhr_std_dev double precision,
  PRIMARY KEY (athlete_id),
  CONSTRAINT fk_athlete FOREIGN KEY (athlete_id) REFERENCES athlete(athlete_id),
  CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES team(team_id),
  CONSTRAINT chk_sleep_performance CHECK (sleep_performance_avg BETWEEN 0 AND 100)
);

CREATE TABLE calculations_schema.all_time_metrics (
  athlete_id integer,
  team_id integer,
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
  sleep_end timestamp with time zone,
  PRIMARY KEY (athlete_id, label),
  FOREIGN KEY (athlete_id) REFERENCES athlete(athlete_id),
  FOREIGN KEY (team_id) REFERENCES team(team_id)
);

CREATE TABLE calculations_schema.all_time_metrics_averages (
  sleep_duration_avg numeric,
  athlete_id integer,
  team_id integer,
  recovery_score_avg numeric,
  strain_avg numeric,
  rhr_avg numeric,
  hrv_avg numeric,
  sleep_performance_avg numeric,
  sleep_consistency_avg numeric,
  sleep_efficiency_avg numeric,
  restorative_sleep_duration_avg numeric,
  restorative_sleep_avg numeric,
  PRIMARY KEY (athlete_id),
  FOREIGN KEY (athlete_id) REFERENCES athlete(athlete_id),
  FOREIGN KEY (team_id) REFERENCES team(team_id)
);

CREATE TABLE calculations_schema.homepage_line_chart_metrics (
  label text,
  time_window text,
  team_id integer,
  workload integer,
  recovery integer,
  PRIMARY KEY (label, time_window, team_id),
  FOREIGN KEY (team_id) REFERENCES team(team_id)
);

CREATE TABLE calculations_schema.performance_line_chart_metrics (
  label text,
  time_window text,
  athlete_id integer,
  team_id integer,
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
  sleep_end timestamp with time zone,
  PRIMARY KEY (athlete_id, label, time_window),
  FOREIGN KEY (athlete_id) REFERENCES athlete(athlete_id),
  FOREIGN KEY (team_id) REFERENCES team(team_id)
);

CREATE TABLE calculations_schema.player_line_chart_metrics (
  workload integer,
  time_window text,
  label text,
  athlete_id integer,
  team_id integer,
  recovery integer,
  PRIMARY KEY (athlete_id, label, time_window),
  FOREIGN KEY (athlete_id) REFERENCES athlete(athlete_id),
  FOREIGN KEY (team_id) REFERENCES team(team_id)
);

CREATE TABLE calculations_schema.recovery_metrics (
  athlete_id integer,
  team_id integer,
  period text,
  value integer,
  PRIMARY KEY (athlete_id, period),
  FOREIGN KEY (athlete_id) REFERENCES athlete(athlete_id),
  FOREIGN KEY (team_id) REFERENCES team(team_id)
);

CREATE TABLE calculations_schema.recovery_metrics_average (
  average integer,
  period text,
  team_id integer,
  PRIMARY KEY (period, team_id),
  FOREIGN KEY (team_id) REFERENCES team(team_id)
);

CREATE TABLE calculations_schema.recovery_squad_availability (
  period text,
  value integer,
  athlete_id integer,
  team_id integer,
  PRIMARY KEY (athlete_id, period),
  FOREIGN KEY (athlete_id) REFERENCES athlete(athlete_id),
  FOREIGN KEY (team_id) REFERENCES team(team_id)
);

CREATE TABLE calculations_schema.workload_metrics (
  athlete_id integer,
  team_id integer,
  value integer,
  period text,
  PRIMARY KEY (athlete_id, period),
  FOREIGN KEY (athlete_id) REFERENCES athlete(athlete_id),
  FOREIGN KEY (team_id) REFERENCES team(team_id)
);

CREATE TABLE calculations_schema.workload_metrics_average (
  period text,
  team_id integer,
  average integer,
  PRIMARY KEY (period, team_id),
  FOREIGN KEY (team_id) REFERENCES team(team_id)
);
