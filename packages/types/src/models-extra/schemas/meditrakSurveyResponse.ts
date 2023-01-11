import { IdForm } from './customProperties/IdForm';

export type MeditrakSurveyResponse = {
  id: IdForm;
  timestamp: string;
  survey_id: IdForm;
  user_id: IdForm;
  clinic_id?: IdForm;
  entity_id?: IdForm;
  start_time?: string;
  end_time?: string;
  data_time?: string;
  approval_status?: string;
};
