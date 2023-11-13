/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Country, Survey } from '../../models';

export type Params = Record<string, never>;

export type RecentSurvey = {
  surveyCode: Survey['code'];
  surveyName: Survey['name'];
  countryName: Country['name'];
  countryId: Country['id'];
};

export type ResBody = RecentSurvey[];
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  userId: string;
  projectId?: string;
}
