/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { formatEntityForResponse } from './format';
import { HierarchyRequest } from './types';

export class SingleEntityRoute extends Route<HierarchyRequest> {
  async buildResponse() {
    const { entity, flat, fields } = this.req.ctx;
    if (flat) {
      return formatEntityForResponse(this.req.ctx, entity, flat);
    }
    return formatEntityForResponse(this.req.ctx, entity, fields);
  }
}
