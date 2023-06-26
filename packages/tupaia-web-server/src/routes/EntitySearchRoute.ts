/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';

export type EntitySearchRequest = Request<{ reportCode: string }, any, any, any>;

export class EntitySearchRoute extends Route<EntitySearchRequest> {
  public async buildResponse() {}
}
