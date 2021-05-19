/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { MultiEntityRelationsRequest, RelationsResponseBody } from './types';
import { RelationsResponseBuilder } from './RelationsResponseBuilder';

export class MultiEntityRelationsRoute extends Route<MultiEntityRelationsRequest> {
  async buildResponse() {
    const { entities } = this.req.ctx;

    const allResponses: RelationsResponseBody = {};
    await Promise.all(
      entities.map(async entity => {
        const singleCtx = { ...this.req.ctx, entity };
        const response = await new RelationsResponseBuilder(
          this.req.models,
          singleCtx,
          this.req.query.groupBy,
        ).build();
        Object.entries(response).forEach(([key, value]) => {
          allResponses[key] = value;
        });
      }),
    );

    return allResponses;
  }
}
