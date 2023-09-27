/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ProjectResponse } from '../web-server';
import { Entity } from '../../models';

type Country = Pick<Entity, 'id' | 'name' | 'code'>;

export type Params = Record<string, never>;
export interface ResBody {
  id?: string;
  userName?: string;
  email?: string;
  project?: ProjectResponse | null;
  projectId?: string;
  country?: Country | null;
}
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
