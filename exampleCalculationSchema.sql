-- Example queries:

-- 1. Insert/Update athlete metrics
INSERT INTO athlete_daily_metrics (
    athlete_id,
    date,
    recovery_score,
    strain_score,
    rhr_score,
    hrv_score,
    sleep_performance_score,
    sleep_consistency_score,
    sleep_efficiency_score,
    sleep_duration_hours,
    restorative_sleep_duration_hours,
    restorative_sleep_score
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
)
ON CONFLICT (athlete_id, date) 
DO UPDATE SET
    recovery_score = EXCLUDED.recovery_score,
    strain_score = EXCLUDED.strain_score,
    rhr_score = EXCLUDED.rhr_score,
    hrv_score = EXCLUDED.hrv_score,
    sleep_performance_score = EXCLUDED.sleep_performance_score,
    sleep_consistency_score = EXCLUDED.sleep_consistency_score,
    sleep_efficiency_score = EXCLUDED.sleep_efficiency_score,
    sleep_duration_hours = EXCLUDED.sleep_duration_hours,
    restorative_sleep_duration_hours = EXCLUDED.restorative_sleep_duration_hours,
    restorative_sleep_score = EXCLUDED.restorative_sleep_score;

-- 2. Insert/Update squad metrics
INSERT INTO squad_daily_metrics (
    squad_id,
    date,
    recovery_score,
    strain_score,
    rhr_score,
    hrv_score,
    sleep_performance_score,
    sleep_consistency_score,
    sleep_efficiency_score,
    sleep_duration_hours,
    restorative_sleep_duration_hours,
    restorative_sleep_score,
    athletes_reported,
    total_athletes
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
)
ON CONFLICT (squad_id, date) 
DO UPDATE SET
    recovery_score = EXCLUDED.recovery_score,
    strain_score = EXCLUDED.strain_score,
    rhr_score = EXCLUDED.rhr_score,
    hrv_score = EXCLUDED.hrv_score,
    sleep_performance_score = EXCLUDED.sleep_performance_score,
    sleep_consistency_score = EXCLUDED.sleep_consistency_score,
    sleep_efficiency_score = EXCLUDED.sleep_efficiency_score,
    sleep_duration_hours = EXCLUDED.sleep_duration_hours,
    restorative_sleep_duration_hours = EXCLUDED.restorative_sleep_duration_hours,
    restorative_sleep_score = EXCLUDED.restorative_sleep_score,
    athletes_reported = EXCLUDED.athletes_reported,
    total_athletes = EXCLUDED.total_athletes;

-- 3. Get last 30 days for an athlete
SELECT * 
FROM athlete_daily_metrics
WHERE athlete_id = $1 
AND date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;

-- 4. Get last 30 days for a squad
SELECT * 
FROM squad_daily_metrics
WHERE squad_id = $1 
AND date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;

-- 5. Get 7-day rolling averages for an athlete
SELECT 
    date,
    recovery_score,
    AVG(recovery_score) OVER (
        ORDER BY date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as recovery_seven_day_avg,
    strain_score,
    AVG(strain_score) OVER (
        ORDER BY date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as strain_seven_day_avg
    -- Add other metrics as needed
FROM athlete_daily_metrics
WHERE athlete_id = $1
AND date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC; 
