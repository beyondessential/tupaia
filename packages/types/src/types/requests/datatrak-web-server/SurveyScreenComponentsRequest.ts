/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { KeysToCamelCase } from '../../../utils';
import { SurveyScreenComponent } from '../../models';

export interface Params {
  surveyCode: string;
}
export type ResBody = KeysToCamelCase<SurveyScreenComponent>[];
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
