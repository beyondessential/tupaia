do $$
declare
  tStartTime TIMESTAMP;

begin
  RAISE NOTICE 'Dropping analytics table indexes...';

  tStartTime := clock_timestamp();
  DROP INDEX IF EXISTS analytics_data_element_entity_date_idx;
  RAISE NOTICE 'Dropped [data_element, entity, date] index, took %', clock_timestamp() - tStartTime;

  tStartTime := clock_timestamp();
  DROP INDEX IF EXISTS analytics_data_group_entity_event_date_idx;
  RAISE NOTICE 'Dropped [data_element, entity, data_group, event, date] index, took %', clock_timestamp() - tStartTime;

end $$;
