/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Project } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

export type Params = Record<string, never>;

type ProjectResponse = KeysToCamelCase<Project>;

export type ResBody = ProjectResponse[];
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  fields?: string[];
}
