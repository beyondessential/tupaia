/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { formatEntitiesForResponse } from './format';
import { MultiEntityRequest } from './types';

export class MultiEntityRoute extends Route<MultiEntityRequest> {
  async buildResponse() {
    const { entities, field, fields } = this.req.ctx;
    return formatEntitiesForResponse(this.req.models, this.req.ctx, entities, field || fields);
  }
}
