-- TODO: Performance Considerations: 
-- If you have large tables, consider indexing frequently queried columns to improve performance.

-- -- SETUP
-- \c postgres;
-- DROP DATABASE IF EXISTS amatra_db;
-- CREATE DATABASE amatra_db;
-- \c amatra_db;

-- Team names
CREATE TABLE team (
    team_id INT GENERATED ALWAYS AS IDENTITY,
    team_name TEXT NOT NULL,
    PRIMARY KEY (team_id)
);

-- athlete table
CREATE TABLE athlete (
    athlete_id INT GENERATED ALWAYS AS IDENTITY,
    athlete_version SMALLINT NOT NULL,
    whoop_email VARCHAR(255) NOT NULL,
    whoop_password VARCHAR(255) NOT NULL,
    whoop_user_id VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(1) NOT NULL,
    team_id BIGINT NOT NULL,
    PRIMARY KEY (athlete_id),
    FOREIGN KEY (team_id) REFERENCES team (team_id)
);

-- Athlete info table
CREATE TABLE athlete_metrics (
    athlete_metrics_id INT GENERATED ALWAYS AS IDENTITY, 
    athlete_id INT NOT NULL,
    "date" DATE NOT NULL,
    height_meter DECIMAL(3, 2) NOT NULL,
    weight_kilogram DECIMAL(5, 2) NOT NULL,
    max_heart_rate SMALLINT NOT NULL,
    PRIMARY KEY (athlete_metrics_id),
    FOREIGN KEY (athlete_id) REFERENCES athlete (athlete_id)
);


-- Cycles table
-- https://developer.whoop.com/docs/developing/user-data/cycle/
CREATE TABLE cycle (
    cycle_id BIGINT UNIQUE,
    athlete_id INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    cycle_start TIMESTAMPTZ NOT NULL,
    cycle_end TIMESTAMPTZ,
    cycle_date DATE,
    timezone_offset VARCHAR(10) NOT NULL,
    score_state VARCHAR(15) NOT NULL,
    PRIMARY KEY (cycle_id),
    FOREIGN KEY (athlete_id) REFERENCES athlete (athlete_id)
);

-- Sleep table
CREATE TABLE sleep (
    sleep_id BIGINT UNIQUE NOT NULL,
    athlete_id INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ  NOT NULL,
    sleep_start TIMESTAMPTZ  NOT NULL,
    sleep_end TIMESTAMPTZ NOT NULL,
    timezone_offset VARCHAR(10) NOT NULL,
    nap BOOLEAN NOT NULL,
    score_state VARCHAR(15) NOT NULL,
    PRIMARY KEY (sleep_id),
    FOREIGN KEY (athlete_id) REFERENCES athlete (athlete_id)
);

-- Sleep performance metrics table
CREATE TABLE sleep_perf_metrics (
    sleep_perf_metrics_id BIGINT GENERATED ALWAYS AS IDENTITY,
    sleep_id BIGINT UNIQUE NOT NULL,
    respiratory_rate DECIMAL(10, 8),
    sleep_performance_percentage DECIMAL(5, 2),
    sleep_consistency_percentage DECIMAL(5, 2),
    sleep_efficiency_percentage DECIMAL(5, 2),
    PRIMARY KEY (sleep_perf_metrics_id),
    FOREIGN KEY (sleep_id) REFERENCES sleep (sleep_id),
    CONSTRAINT sleep_performance_percentage_range CHECK (sleep_performance_percentage BETWEEN 0 AND 100),
    CONSTRAINT sleep_consistency_percentage_range CHECK (sleep_consistency_percentage BETWEEN 0 AND 100),
    CONSTRAINT sleep_efficiency_percentage_range CHECK (sleep_efficiency_percentage BETWEEN 0 AND 100)
);

-- Sleep stage metrics
CREATE TABLE sleep_stage_metrics (
    sleep_stage_metrics_id BIGINT GENERATED ALWAYS AS IDENTITY,
    sleep_id BIGINT NOT NULL,
    total_in_bed_time_milli BIGINT,
    total_awake_time_milli BIGINT,
    total_no_data_time_milli BIGINT,
    total_light_sleep_time_milli BIGINT,
    total_slow_wave_sleep_time_milli BIGINT,
    total_rem_sleep_time_milli BIGINT,
    sleep_cycle_count SMALLINT,
    disturbance_count SMALLINT,
    PRIMARY KEY (sleep_stage_metrics_id),
    FOREIGN KEY (sleep_id) REFERENCES sleep (sleep_id)
);

-- Sleep need metrics
CREATE TABLE sleep_need_metrics (
    sleep_need_metrics_id BIGINT GENERATED ALWAYS AS IDENTITY,
    sleep_id BIGINT NOT NULL,
    baseline_milli BIGINT, 
    need_from_sleep_debt_milli BIGINT,
    need_from_recent_strain_milli BIGINT,
    need_from_recent_nap_milli BIGINT,
    PRIMARY KEY (sleep_need_metrics_id),
    FOREIGN KEY (sleep_id) REFERENCES sleep (sleep_id)
);

-- Recovery table
CREATE TABLE "recovery" (
    recovery_id BIGINT GENERATED ALWAYS AS IDENTITY,
    cycle_id BIGINT NOT NULL,
    sleep_id BIGINT NOT NULL,
    athlete_id INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    score_state VARCHAR(15) NOT NULL,
    PRIMARY KEY (recovery_id),
    FOREIGN KEY (cycle_id) REFERENCES cycle (cycle_id),
    FOREIGN KEY (sleep_id) REFERENCES sleep (sleep_id),
    FOREIGN KEY (athlete_id) REFERENCES athlete (athlete_id)
);

-- Recovery metrics table
CREATE TABLE recovery_metrics (
    recovery_metrics_id BIGINT GENERATED ALWAYS AS IDENTITY,
    recovery_id BIGINT NOT NULL,
    recovery_score DECIMAL(4, 1),
    resting_heart_rate DECIMAL(4, 1),
    hrv_rmssd_milli DECIMAL(7, 3),
    spo2_percentage DECIMAL(4, 2),
    skin_temp_celsius DECIMAL(4, 2),
    PRIMARY KEY (recovery_metrics_id),
    FOREIGN KEY (recovery_id) REFERENCES "recovery" (recovery_id)
);

-- Cycle metrics table
CREATE TABLE cycle_metrics (
    cycle_metrics_id BIGINT GENERATED ALWAYS AS IDENTITY,
    cycle_id BIGINT NOT NULL,
    strain DECIMAL(10, 7) NOT NULL,
    kilojoule DECIMAL(10, 5) NOT NULL,
    avg_heart_rate SMALLINT NOT NULL,
    max_heart_rate SMALLINT NOT NULL,
    PRIMARY KEY (cycle_metrics_id),
    FOREIGN KEY (cycle_id) REFERENCES cycle (cycle_id)
);

-- user info table
CREATE TABLE user_info (
    user_info_id INT GENERATED ALWAYS AS IDENTITY ,
    user_info_version SMALLINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    PRIMARY KEY (user_info_id)
);

-- User table
CREATE TABLE "user" (
    supabase_auth_uid VARCHAR(50) NOT NULL,
    user_info_id INT NOT NULL,
    "role" VARCHAR(30) NOT NULL,
    "password" VARCHAR(20) NOT NULL,
    PRIMARY KEY (supabase_auth_uid),
    FOREIGN KEY (user_info_id) REFERENCES user_info (user_info_id)
);

-- User's organisation table
CREATE TABLE user_team (
    user_team_id INT GENERATED ALWAYS AS IDENTITY,
    supabase_auth_uid VARCHAR(50) NOT NULL,
    team_id INT NOT NULL,
    PRIMARY KEY (user_team_id),
    FOREIGN KEY (supabase_auth_uid) REFERENCES "user"(supabase_auth_uid),
    FOREIGN KEY (team_id) REFERENCES team (team_id)
);

-- ---------------------------

-- Sport reference table
CREATE TABLE sport (
    sport_id SMALLINT UNIQUE,
    sport_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (sport_id)
);

INSERT INTO sport (sport_id, sport_name) VALUES
(-1, 'Activity'),
(0, 'Running'),
(1, 'Cycling'),
(16, 'Baseball'),
(17, 'Basketball'),
(18, 'Rowing'),
(19, 'Fencing'),
(20, 'Field Hockey'),
(21, 'Football'),
(22, 'Golf'),
(24, 'Ice Hockey'),
(25, 'Lacrosse'),
(27, 'Rugby'),
(28, 'Sailing'),
(29, 'Skiing'),
(30, 'Soccer'),
(31, 'Softball'),
(32, 'Squash'),
(33, 'Swimming'),
(34, 'Tennis'),
(35, 'Track & Field'),
(36, 'Volleyball'),
(37, 'Water Polo'),
(38, 'Wrestling'),
(39, 'Boxing'),
(42, 'Dance'),
(43, 'Pilates'),
(44, 'Yoga'),
(45, 'Weightlifting'),
(47, 'Cross Country Skiing'),
(48, 'Functional Fitness'),
(49, 'Duathlon'),
(51, 'Gymnastics'),
(52, 'Hiking/Rucking'),
(53, 'Horseback Riding'),
(55, 'Kayaking'),
(56, 'Martial Arts'),
(57, 'Mountain Biking'),
(59, 'Powerlifting'),
(60, 'Rock Climbing'),
(61, 'Paddleboarding'),
(62, 'Triathlon'),
(63, 'Walking'),
(64, 'Surfing'),
(65, 'Elliptical'),
(66, 'Stairmaster'),
(70, 'Meditation'),
(71, 'Other'),
(73, 'Diving'),
(74, 'Operations - Tactical'),
(75, 'Operations - Medical'),
(76, 'Operations - Flying'),
(77, 'Operations - Water'),
(82, 'Ultimate'),
(83, 'Climber'),
(84, 'Jumping Rope'),
(85, 'Australian Football'),
(86, 'Skateboarding'),
(87, 'Coaching'),
(88, 'Ice Bath'),
(89, 'Commuting'),
(90, 'Gaming'),
(91, 'Snowboarding'),
(92, 'Motocross'),
(93, 'Caddying'),
(94, 'Obstacle Course Racing'),
(95, 'Motor Racing'),
(96, 'HIIT'),
(97, 'Spin'),
(98, 'Jiu Jitsu'),
(99, 'Manual Labor'),
(100, 'Cricket'),
(101, 'Pickleball'),
(102, 'Inline Skating'),
(103, 'Box Fitness'),
(104, 'Spikeball'),
(105, 'Wheelchair Pushing'),
(106, 'Paddle Tennis'),
(107, 'Barre'),
(108, 'Stage Performance'),
(109, 'High Stress Work'),
(110, 'Parkour'),
(111, 'Gaelic Football'),
(112, 'Hurling/Camogie'),
(113, 'Circus Arts'),
(121, 'Massage Therapy'),
(123, 'Strength Trainer'),
(125, 'Watching Sports'),
(126, 'Assault Bike'),
(127, 'Kickboxing'),
(128, 'Stretching'),
(230, 'Table Tennis'),
(231, 'Badminton'),
(232, 'Netball'),
(233, 'Sauna'),
(234, 'Disc Golf'),
(235, 'Yard Work'),
(236, 'Air Compression'),
(237, 'Percussive Massage'),
(238, 'Paintball'),
(239, 'Ice Skating'),
(240, 'Handball');


-- Workout table
CREATE TABLE workout (
    workout_id BIGINT UNIQUE NOT NULL,
    athlete_id INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    workout_start TIMESTAMPTZ NOT NULL,
    workout_end TIMESTAMPTZ NOT NULL,
    timezone_offset VARCHAR(10) NOT NULL,
    sport_id SMALLINT NOT NULL,
    score_state VARCHAR(20) NOT NULL,
    PRIMARY KEY (workout_id),
    FOREIGN KEY (athlete_id) REFERENCES athlete (athlete_id),
    FOREIGN KEY (sport_id) REFERENCES sport (sport_id)
);

-- Workout metrics table
CREATE TABLE workout_metrics (
    workout_metrics_id BIGINT GENERATED ALWAYS AS IDENTITY,
    workout_id BIGINT UNIQUE NOT NULL, 
    strain DECIMAL(6,4) NOT NULL,
    average_heart_rate SMALLINT NOT NULL,
    max_heart_rate SMALLINT NOT NULL,
    kilojoule DECIMAL(8,2) NOT NULL,
    percent_recorded DECIMAL(4,1) NOT NULL,
    distance_meter DECIMAL(12,2),
    altitude_gain_meter DECIMAL(10,2),
    altitude_change_meter DECIMAL(10,2),
    PRIMARY KEY (workout_metrics_id),
    FOREIGN KEY (workout_id) REFERENCES workout (workout_id)
);

-- Zone durations table (for workouts)
CREATE TABLE zone_durations (
    zone_durations_id BIGINT GENERATED ALWAYS AS IDENTITY,
    workout_id BIGINT NOT NULL,
    zone_zero_mlli BIGINT,
    zone_one_mlli BIGINT,
    zone_two_mlli BIGINT,
    zone_three_mlli BIGINT,
    zone_four_mlli BIGINT,
    zone_five_mlli BIGINT,
    PRIMARY KEY (zone_durations_id),
    FOREIGN KEY (workout_id) REFERENCES workout (workout_id)
);

-- ---------------------------

-- BEHAVIOURAL SCHEMA

-- Create a reference table for behaviour categories
CREATE TABLE behaviour_category (
    category_id SMALLINT GENERATED ALWAYS AS IDENTITY,
    category_name VARCHAR(50) UNIQUE NOT NULL,
    PRIMARY KEY (category_id)
);

-- Insert predefined categories
INSERT INTO behaviour_category (category_name) VALUES
('Team Activity'),
('Circadian'),
('Lifestyle'),
('Mindset'),
('Wellbeing'),
('Nutrition'),
('Recovery Therapies'),
('Sleep Habits');

-- Main table for behavior form submissions
CREATE TABLE behaviour_submission (
    behaviour_submission_id BIGINT GENERATED ALWAYS AS IDENTITY,
    cycle_id BIGINT NOT NULL,
    submission_status BOOLEAN NOT NULL,
    PRIMARY KEY (behaviour_submission_id),
    FOREIGN KEY (cycle_id) REFERENCES cycle (cycle_id)
);


-----  BEHAVIOUR TABLES  ------


--- CIRCADIAN ---

-- Morning sunlight
CREATE TABLE morning_sunlight (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    morning_sunlight BOOLEAN,
    duration INTERVAL,
    occurrence_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

-- Watch sunset
CREATE TABLE watch_sunset (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    watch_sunset BOOLEAN,
    duration INTERVAL,
    occurrence_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

--- LIFESTYLE ---

-- Sexual activity
CREATE TABLE sexual_activity (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    sexual_activity BOOLEAN,
    occurrence_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

-- Caffeine consumption
CREATE TABLE caffeine_consumption (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    caffeine_consumption BOOLEAN NOT NULL,
    servings SMALLINT NOT NULL CHECK (servings BETWEEN 0 AND 10),
    last_serving_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

-- Masturbation
CREATE TABLE masturbation (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    masturbation BOOLEAN,
    occurrence_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

-- Connect with family/friends
CREATE TABLE connect_family_friends (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    connect_family_friends BOOLEAN,
    duration INTERVAL,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

CREATE TABLE spiritual_practice (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    spiritual_practice BOOLEAN,
    duration INTERVAL,
    occurrence_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)    
);

--- MINDSET ---

CREATE TABLE gratitude (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    extent SMALLINT NOT NULL CHECK (extent BETWEEN 0 AND 3), -- inline constraint
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
    );

CREATE TABLE positive_anticipation (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    extent SMALLINT NOT NULL CHECK (extent BETWEEN 0 AND 3),
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

CREATE TABLE sense_of_purpose (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    extent SMALLINT NOT NULL CHECK (extent BETWEEN 0 AND 3),
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

CREATE TABLE learning (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    extent SMALLINT NOT NULL CHECK (extent BETWEEN 0 AND 3),
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);


CREATE TABLE progress_on_goal (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    extent SMALLINT NOT NULL CHECK (extent BETWEEN 0 AND 3),
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

--- WELLBEING ---

-- Wellbeing factors

CREATE TABLE motivation (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    extent SMALLINT NOT NULL CHECK (extent BETWEEN 0 AND 3),
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

CREATE TABLE feeling_in_control (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    extent SMALLINT NOT NULL CHECK (extent BETWEEN 0 AND 3),
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

CREATE TABLE social_fulfillment (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    extent SMALLINT NOT NULL CHECK (extent BETWEEN 0 AND 3),
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

CREATE TABLE anxiety (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    extent SMALLINT NOT NULL CHECK (extent BETWEEN 0 AND 3),
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

CREATE TABLE feeling_sick (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    extent SMALLINT NOT NULL CHECK (extent BETWEEN 0 AND 3),
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);


--- NUTRITION ---

CREATE TABLE feeding_window (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    fasting_state BOOLEAN,
    first_meal_time TIME,
    last_meal_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

-- Added sugar
CREATE TABLE added_sugar (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    added_sugar BOOLEAN,
    quantity INT,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

--- RECOVERY THERAPIES ---

-- Active recovery / Zone 2 Cardio
CREATE TABLE zone2_active_recovery (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    zone2_active_recovery BOOLEAN,
    duration INTERVAL,
    activity_type VARCHAR(50),
    last_session_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

-- Meditation
CREATE TABLE meditation (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    meditation BOOLEAN,
    duration INTERVAL,
    last_session_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

-- Stretching
CREATE TABLE stretching (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    stretching BOOLEAN,
    duration INTERVAL,
    last_session_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

-- Cold Shower
CREATE TABLE cold_shower (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    cold_shower BOOLEAN,
    duration INTERVAL,
    last_session_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

-- Cold Plunge
CREATE TABLE cold_plunge (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    cold_plunge BOOLEAN,
    duration INTERVAL,
    last_session_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

-- Cryotherapy
CREATE TABLE cryotherapy (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    cryotherapy BOOLEAN,
    duration INTERVAL,
    last_session_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

-- Sauna
CREATE TABLE sauna (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    sauna BOOLEAN,
    duration INTERVAL,
    last_session_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

-- Contrast Therapy
CREATE TABLE contrast_therapy (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    contrast_therapy BOOLEAN,
    duration INTERVAL,
    last_session_time TIME,
    PRIMARY KEY (id),    
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

-- Breathwork
CREATE TABLE breathwork (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    breathwork BOOLEAN,
    duration INTERVAL,
    last_session_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

-- Foam Rolling
CREATE TABLE foam_rolling (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    foam_rolling BOOLEAN,
    duration INTERVAL,
    last_session_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

-- Massage
CREATE TABLE massage (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    massage BOOLEAN,
    duration INTERVAL,
    last_session_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
    );

--Massage_gun
CREATE TABLE massage_gun (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    massage_gun BOOLEAN,
    category_id SMALLINT NOT NULL,
    duration INTERVAL,
    last_session_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
    );

-- Recovery Sleeves
CREATE TABLE recovery_sleeves (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    recovery_sleeves BOOLEAN,
    duration INTERVAL,
    last_session_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
    );

-- Yoga / Pilates
CREATE TABLE yoga_pilates (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    yoga_pilates BOOLEAN,
    duration INTERVAL,
    last_session_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
    );

-- SLEEP HABITS

-- Hot bedtime shower
CREATE TABLE hot_bathing (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    hot_bathing BOOLEAN,
    duration INTERVAL,
    occurrence_time TIME,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

-- Bedtime screens
CREATE TABLE bedtime_screens (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    bedtime_screens BOOLEAN,
    duration INTERVAL,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

-- Bedtime reading
CREATE TABLE bedtime_reading (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    category_id SMALLINT NOT NULL,
    bedtime_reading BOOLEAN,
    duration INTERVAL,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES behaviour_category (category_id)
);

-- Bed Share
CREATE TABLE bed_share (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    bed_share BOOLEAN,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE
);

-- Same Bed as usual
CREATE TABLE same_bed (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    same_bed BOOLEAN,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE
);

-- BLGs (Blue Light Blocking Glasses)
CREATE TABLE blgs (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    blgs BOOLEAN,
    duration INTERVAL,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE
);

-- Sleep Mask
CREATE TABLE sleep_mask (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    sleep_mask BOOLEAN,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE
);

-- Ear Plugs
CREATE TABLE ear_plugs (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    ear_plugs BOOLEAN,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE
);

-- Mouth Tape
CREATE TABLE mouth_tape (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    behaviour_submission_id BIGINT NOT NULL,
    mouth_tape BOOLEAN,
    PRIMARY KEY (id),
    FOREIGN KEY (behaviour_submission_id) REFERENCES behaviour_submission (behaviour_submission_id) ON DELETE CASCADE
);