import { Route } from '@tupaia/server-boilerplate';
import { RelationshipsRequest } from './types';
import { ResponseBuilder } from './ResponseBuilder';

export class EntityRelationshipsRoute extends Route<RelationshipsRequest> {
  public async buildResponse() {
    return new ResponseBuilder(
      this.req.models,
      { ...this.req.ctx, entities: [this.req.ctx.entity] },
      this.req.query.groupBy,
    ).build();
  }
}
