do $$ 
declare
  tStartTime TIMESTAMP;

begin
  RAISE NOTICE 'Creating analytics table indexes...';
  
  tStartTime := clock_timestamp();
  CREATE INDEX analytics_data_element_entity_date_idx ON public.analytics(data_element_code, entity_code, date desc);
  RAISE NOTICE 'Created [data_element, entity, date] index, took % % %', clock_timestamp() - tStartTime, chr(10), chr(10);
  
  tStartTime := clock_timestamp();
  CREATE INDEX analytics_data_element_entity_survey_date_idx ON public.analytics(data_element_code, entity_code, survey_code, date desc);
  RAISE NOTICE 'Created [data_element, entity, survey, date] index, took % % %', clock_timestamp() - tStartTime, chr(10), chr(10);
  
  tStartTime := clock_timestamp();
  CREATE INDEX analytics_data_element_entity_survey_event_date_idx ON public.analytics(data_element_code, entity_code, survey_code, event_id, date desc);
  RAISE NOTICE 'Created [data_element, entity, survey, event, date] index, took % % %', clock_timestamp() - tStartTime, chr(10), chr(10);

end $$;