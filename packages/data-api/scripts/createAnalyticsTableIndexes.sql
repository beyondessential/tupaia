do $$ 
declare
begin 
  CREATE INDEX analytics_data_element_code_entity_code_date_idx ON public.analytics(data_element_code, entity_code, date desc);
  CREATE INDEX analytics_data_element_code_entity_code_survey_code_date_idx ON public.analytics(data_element_code, entity_code, survey_code, date desc);
  CREATE INDEX analytics_data_element_code_entity_code_survey_code_event_id_date_idx ON public.analytics(data_element_code, entity_code, survey_code, event_id, date desc);
  RAISE NOTICE 'Added analytics table indexes';
end $$;