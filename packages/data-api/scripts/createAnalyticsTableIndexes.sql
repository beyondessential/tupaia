do $$ 
declare
  tStartTime TIMESTAMP;
  tAnalyticsIndexName TEXT := 'analytics_data_element_entity_date_idx';
  tEventsIndexName TEXT := 'analytics_data_group_entity_event_date_idx';

begin
  RAISE NOTICE 'Creating analytics table indexes...';
  
  IF (SELECT count(*) = 0
    FROM pg_class c
    WHERE c.relname = tAnalyticsIndexName 
    AND c.relkind = 'i')
  THEN
    tStartTime := clock_timestamp();
    PERFORM mv$addIndexToMv$Table(mv$buildAllConstants(), 'public', 'analytics', tAnalyticsIndexName, 'data_element_code, entity_code, date desc');
    RAISE NOTICE 'Created analytics index, took %', clock_timestamp() - tStartTime;
  ELSE
    RAISE NOTICE 'Analytics index already exists, skipping';
  END IF;

  IF (SELECT count(*) = 0
    FROM pg_class c
    WHERE c.relname = tEventsIndexName 
    AND c.relkind = 'i')
  THEN
    tStartTime := clock_timestamp();
    PERFORM mv$addIndexToMv$Table(mv$buildAllConstants(), 'public', 'analytics', tEventsIndexName, 'data_group_code, entity_code, event_id, date desc');
    RAISE NOTICE 'Created events index, took %', clock_timestamp() - tStartTime;
  ELSE
    RAISE NOTICE 'Events index already exists, skipping';
  END IF;

end $$;