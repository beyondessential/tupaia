/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { MultiEntityRelationshipsRequest, RelationshipsResponseBody } from './types';
import { ResponseBuilder } from './ResponseBuilder';

export class MultiEntityRelationshipsRoute extends Route<MultiEntityRelationshipsRequest> {
  async buildResponse() {
    const { entities } = this.req.ctx;

    const allResponses: RelationshipsResponseBody = {};
    await Promise.all(
      entities.map(async entity => {
        const singleCtx = { ...this.req.ctx, entity };
        const response = await new ResponseBuilder(
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
