/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { HierarchyRequest } from './types';

export class SingleEntityRoute extends Route<HierarchyRequest> {
  async buildResponse() {
    return this.res.ctx.formatEntityForResponse(this.req.ctx.entity);
  }
}
