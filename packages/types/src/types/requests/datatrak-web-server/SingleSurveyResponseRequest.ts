/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { SurveyResponse } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

export type Params = {
  id: string;
};

export interface ResBody extends KeysToCamelCase<SurveyResponse> {
  answers: Record<string, string>;
}
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
