/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

export type SurveyResponseObject = Record<string, unknown>;

type Answer = {
  id: string;
  type: string;
  question_id: string;
  body: string;
};

type EntityCreated = {
  id: string;
  code: string;
  parent_id?: string;
  name: string;
  type: string;
  country_code: string;
};

type OptionCreated = {
  id: string;
  value: string;
  option_set_id: string;
  sort_order?: string;
};

export type ValidatedSurveyResponseObject = {
  id: string;
  clinic_id?: string;
  entity_id?: string;
  start_time?: string;
  end_time?: string;
  data_time?: string;
  survey_id: string;
  user_id: string;
  answers: Answer[];
  entities_created?: EntityCreated[];
  options_created?: OptionCreated[];
  submission_time?: string;
  timezone?: string;
  assessor_name?: string;
  approval_status?: string;
};
