/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Survey } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

export type Params = Record<string, never>;
export type ResBody = KeysToCamelCase<Survey>[];
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  fields?: string[];
}
