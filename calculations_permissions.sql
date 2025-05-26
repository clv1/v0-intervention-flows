DO
$$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'calculations_schema'
          AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE calculations_schema.%I TO anon, authenticated;', r.table_name);
    END LOOP;
END;
$$;
