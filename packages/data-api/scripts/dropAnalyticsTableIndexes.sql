do $$
declare
  tStartTime TIMESTAMP;
  tAnalyticsIndexName TEXT := 'analytics_data_element_entity_date_idx';
  tEventsIndexName TEXT := 'analytics_data_group_entity_event_date_idx';

begin
  RAISE NOTICE 'Dropping analytics table indexes...';

  IF (SELECT count(*) > 0
    FROM pg_class c
    WHERE c.relname = tAnalyticsIndexName 
    AND c.relkind = 'i')
  THEN
    tStartTime := clock_timestamp();
    PERFORM mv$removeIndexFromMv$Table(mv$buildAllConstants(), tAnalyticsIndexName);
    RAISE NOTICE 'Dropped analytics index, took %', clock_timestamp() - tStartTime;
  ELSE
    RAISE NOTICE 'Analytics index doesn''t exist, skipping';
  END IF;

  IF (SELECT count(*) > 0
    FROM pg_class c
    WHERE c.relname = tEventsIndexName 
    AND c.relkind = 'i')
  THEN
    tStartTime := clock_timestamp();
    PERFORM mv$removeIndexFromMv$Table(mv$buildAllConstants(), tEventsIndexName);
    RAISE NOTICE 'Dropped events index, took %', clock_timestamp() - tStartTime;
  ELSE
    RAISE NOTICE 'Events index doesn''t exist, skipping';
  END IF;

end $$;
