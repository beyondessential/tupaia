/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { MeditrakSurveyResponseRequest } from '../central-server/MeditrakSurveyResponseRequest';

export type EntityQuestionConfig = {
  entity?: {
    createNew?: boolean;
    fields?: Record<string, string | { questionId: string }>;
    filter?: {
      type?: string[];
      grandparentId?: { questionId: string };
      parentId?: { questionId: string };
      attributes?: Record<string, { questionId: string }>;
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

type SurveyResponse = MeditrakSurveyResponseRequest & {
  options_created: CreatedOption[];
  entities_upserted: EntityUpsert[];
};

export type Params = Record<string, never>;
export type ResBody = void;
export type ReqBody = SurveyResponse;
export type ReqQuery = Record<string, never>;
