/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Country, Entity, Survey, SurveyResponse } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

export type Params = {
  id: string;
};

export interface ResBody extends KeysToCamelCase<SurveyResponse> {
  answers: Record<string, string>;
  countryName: Country['name'];
  entityName: Entity['name'];
  entityId: Entity['id'];
  surveyName: Survey['name'];
  surveyCode: Survey['code'];
  countryCode: Country['code'];
}
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
