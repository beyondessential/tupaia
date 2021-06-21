do $$ 
declare
  tStartTime TIMESTAMP;

begin
  RAISE NOTICE 'Creating analytics table indexes...';
  
  tStartTime := clock_timestamp();
  CREATE INDEX IF NOT EXISTS analytics_data_element_entity_date_idx ON public.analytics(data_element_code, entity_code, date desc);
  RAISE NOTICE 'Created [data_element, entity, date] index, took %', clock_timestamp() - tStartTime;
  
  tStartTime := clock_timestamp();
  CREATE INDEX IF NOT EXISTS analytics_data_group_entity_event_date_idx ON public.analytics(data_group_code, entity_code, event_id, date desc);
  RAISE NOTICE 'Created [data_group, entity, event, date] index, took %', clock_timestamp() - tStartTime;

end $$;