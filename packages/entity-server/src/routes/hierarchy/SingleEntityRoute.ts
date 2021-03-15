/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Route } from '../Route';
import { HierarchyRequest, HierarchyResponse } from './types';

export class SingleEntityRoute extends Route<HierarchyRequest, HierarchyResponse> {
  async buildResponse() {
    return this.res.context.formatEntityForResponse(this.req.context.entity);
  }
}
