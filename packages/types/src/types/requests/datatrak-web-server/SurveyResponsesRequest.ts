/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { SurveyResponse as SurveyResponseT, Country, Entity, Survey } from '../../models';

export type Params = Record<string, never>;

type SurveyResponse = {
  assessorName: SurveyResponseT['assessor_name'];
  countryName: Country['name'];
  dataTime: Date;
  entityName: Entity['name'];
  id: SurveyResponseT['id'];
  surveyName: Survey['name'];
  surveyCode: Survey['code'];
};

export type ResBody = SurveyResponse[];
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  fields?: string[];
  userId: string;
  pageSize?: number;
  sort?: string[];
}
