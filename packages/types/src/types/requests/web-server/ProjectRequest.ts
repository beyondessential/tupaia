/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Entity, Project } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

export interface Params {
  projectCode: string;
}
export type ProjectResponse = KeysToCamelCase<Project> & {
  name: string;
  names?: Entity['name'][];
  hasAccess: boolean;
  hasPendingAccess: boolean;
};

export type ResBody = ProjectResponse;
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
