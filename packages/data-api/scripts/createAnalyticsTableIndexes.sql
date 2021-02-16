do $$ 
declare
begin 
  CREATE INDEX analytics_data_element_entity_date_idx ON public.analytics(data_element_code, entity_code, date desc);
  CREATE INDEX analytics_data_element_entity_survey_date_idx ON public.analytics(data_element_code, entity_code, survey_code, date desc);
  CREATE INDEX analytics_data_element_entity_survey_event_date_idx ON public.analytics(data_element_code, entity_code, survey_code, event_id, date desc);
  RAISE NOTICE 'Added analytics table indexes';
end $$;