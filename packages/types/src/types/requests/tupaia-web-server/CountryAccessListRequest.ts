/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { Country, Project } from '../../models';

export type Params = Record<string, never>;

interface CountryAccess {
  id: Country['id'];
  name: Country['name'];
  hasAccess: boolean;
  accessRequests: Project['code'][];
}
export type ResBody = CountryAccess[];

export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
