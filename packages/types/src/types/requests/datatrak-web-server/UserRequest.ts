/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ProjectResponse } from '../web-server';
import { Entity } from '../../models';
import { KeysToCamelCase } from '../../../utils';

export type Params = Record<string, never>;
export interface ResBody {
  id?: string;
  userName?: string;
  email?: string;
  preferences?: any;
  project?: ProjectResponse | null;
  projectId?: string;
  country?: KeysToCamelCase<Entity> | null;
}
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
