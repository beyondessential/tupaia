/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { RelationsRequest } from './types';
import { RelationsResponseBuilder } from './RelationsResponseBuilder';

export class EntityRelationsRoute extends Route<RelationsRequest> {
  async buildResponse() {
    return new RelationsResponseBuilder(
      this.req.models,
      this.req.ctx,
      this.req.query.groupBy,
    ).build();
  }
}
