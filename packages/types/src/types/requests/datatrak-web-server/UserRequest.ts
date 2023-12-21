/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ProjectResponse } from '../web-server';
import { Country } from '../../models';

export type Params = Record<string, never>;
export interface ResBody {
  id?: string;
  userName?: string;
  email?: string;
  project?: ProjectResponse | null;
  projectId?: string;
  country?: Country | null;
  deleteAccountRequested?: boolean;
}
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
