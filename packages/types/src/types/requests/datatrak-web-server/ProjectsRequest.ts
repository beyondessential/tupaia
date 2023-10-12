/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { ProjectResponse } from '../web-server';

export type Params = Record<string, never>;

export type ResBody = ProjectResponse[];
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  fields?: string[];
}
