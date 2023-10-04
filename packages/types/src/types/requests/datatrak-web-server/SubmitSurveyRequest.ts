/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Country, Entity, Survey } from '../../models';

export type EntityQuestionConfig = {
  entity: {
    createNew: boolean;
    fields: Record<string, string | { questionId: string }>;
    filter: {
      type: string[];
      grandparentId: { questionId: string };
      parentId: { questionId: string };
      attributes: Record<string, { questionId: string }>;
    };
  };
};

export type EntityUpsert = {
  questionId: string;
  config: EntityQuestionConfig;
};

export type CreatedOption = {
  option_set_id: string;
  value: string;
  label: string;
};

type Answer = string | number | boolean | null | undefined;

export type Answers = Record<string, Answer>;

type SurveyResponse = {
  answers: Answers;
  survey_id: Survey['id'];
  start_time: string;
  data_time: string;
  entity_id: Entity['id'];
  country_id: Country['id'];
  end_time: string;
  timestamp: string;
  timezone: string;
  options_created: CreatedOption[];
  entities_upserted: EntityUpsert[];
};

export type Params = Record<string, never>;
export type ResBody = void;
export type ReqBody = SurveyResponse;
export type ReqQuery = Record<string, never>;
