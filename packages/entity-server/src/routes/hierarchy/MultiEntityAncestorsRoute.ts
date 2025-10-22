import { Route } from '@tupaia/server-boilerplate';
import { formatEntitiesForResponse } from './format';
import {
  MultiEntityRequest,
  MultiEntityRequestParams,
  MultiEntityRequestBody,
  EntityRequestQuery,
  EntityResponse,
} from './types';

export type MultiEntityAncestorsRequest = MultiEntityRequest<
  MultiEntityRequestParams,
  EntityResponse[],
  MultiEntityRequestBody,
  EntityRequestQuery & { includeRootEntity?: string }
>;
export class MultiEntityAncestorsRoute extends Route<MultiEntityAncestorsRequest> {
  public async buildResponse() {
    const { hierarchyId, entities, fields, field, filter } = this.req.ctx;
    const { includeRootEntity: includeRootEntityString = 'false' } = this.req.query;
    const includeRootEntity = includeRootEntityString?.toLowerCase() === 'true';
    const ancestors = await this.req.models.entity.getAncestorsOfEntities(
      hierarchyId,
      entities.map(entity => entity.id),
      { ...filter },
    );
    const entitiesToUse: EntityRecord[] = includeRootEntity
      ? entities.concat(ancestors)
      : ancestors;

    return formatEntitiesForResponse(this.req.models, this.req.ctx, entitiesToUse, field || fields);
  }
}
