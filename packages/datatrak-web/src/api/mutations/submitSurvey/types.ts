/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { Entity, EntityQuestionConfig, Survey, SurveyScreenComponent } from '../../../types';

export type AutocompleteAnswer = {
  isNew?: boolean;
  optionSetId: string;
  value: string;
  label: string;
};

type Answer = string | number | boolean | null | undefined | AutocompleteAnswer;

export type Answers = Record<string, Answer>;

type EntityUpsert = {
  questionId: string;
  config: EntityQuestionConfig;
};

type CreatedOption = {
  option_set_id: string;
  value: string;
  label: string;
};

export type SurveyResponseData = {
  surveyId?: Survey['id'];
  countryId?: Entity['id'];
  questions?: SurveyScreenComponent[];
  answers?: Answers;
  surveyStartTime?: string;
};

export type SurveyResponse = {
  survey_id: Survey['id'];
  start_time: string;
  data_time: string;
  entity_id: Entity['id'];
  end_time: string;
  timestamp: string;
  timezone: string;
  options_created: CreatedOption[];
  entities_upserted: EntityUpsert[];
};
