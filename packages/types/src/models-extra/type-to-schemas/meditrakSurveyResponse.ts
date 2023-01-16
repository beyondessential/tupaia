import { EntityType } from '../../models';
import { Id } from './customFormat';

type AnswerType = {
  id: Id;
  type: string;
  body: string;
  /**
   * @checkIdExists { "table": "question" }
   */
  question_id: string;
};

type EntityCreated = {
  id: Id;
  code: string;
  parent_id: Id;
  name: string;
  type: EntityType;
  country_code: string;
};

type OptionCreated = {
  id: Id;
  value: number;
  /**
   * @checkIdExists { "table": "optionSet" }
   */
  option_set_id: string;
  sort_order: number;
};

export interface MeditrakSurveyResponse {
  id: Id;
  /**
   * @format iso-date-time
   */
  timestamp: string;
  survey_id: Id;
  user_id: Id;
  answers: AnswerType[];
  clinic_id?: Id;
  entity_id?: Id;
  /**
   * @format iso-date-time
   */
  start_time?: string;
  /**
   * @format iso-date-time
   */
  end_time?: string;
  /**
   * @format iso-date-time
   */
  data_time?: string;
  approval_status?: string;
  entities_created?: EntityCreated[];
  options_created?: OptionCreated[];
  /**
   * @description only used in meditrak-app-server, v1.7.87 to v1.9.110 (inclusive) uses submission_time
   */
  submission_time?: string;
  timezone?: string;
}
