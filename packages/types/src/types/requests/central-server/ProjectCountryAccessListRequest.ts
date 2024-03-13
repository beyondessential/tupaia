/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Entity, Project } from '../..';

export interface Params {
  projectCode: string;
}

export interface CountryAccessObject {
  id: Entity['id'];
  name: Entity['name'];
  code: Entity['code'];
  hasAccess: boolean;
  hasPendingAccess: boolean;
}
export type ResBody = CountryAccessObject[];

export type ReqBody = Record<string, never>;
export interface ReqQuery {
  projectId: Project['id'];
}
