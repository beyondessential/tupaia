/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Project } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

export interface Params {
  projectCode: string;
}

export type ResBody = KeysToCamelCase<Project> & {
  entityName: string;
};
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
