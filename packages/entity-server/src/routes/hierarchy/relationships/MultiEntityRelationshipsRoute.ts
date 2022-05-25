/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { MultiEntityRelationshipsRequest } from './types';
import { ResponseBuilder } from './ResponseBuilder';

export class MultiEntityRelationshipsRoute extends Route<MultiEntityRelationshipsRequest> {
  public async buildResponse() {
    return new ResponseBuilder(this.req.models, this.req.ctx, this.req.query.groupBy).build();
  }
}
