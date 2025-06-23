import { Route } from '@tupaia/server-boilerplate';
import { formatEntitiesForResponse } from './format';
import {
  MultiEntityRequest,
  MultiEntityRequestParams,
  MultiEntityRequestBody,
  EntityRequestQuery,
  EntityResponse,
} from './types';

export type MultiEntityDescendantsRequest = MultiEntityRequest<
  MultiEntityRequestParams,
  EntityResponse[],
  MultiEntityRequestBody,
  EntityRequestQuery & { includeRootEntity?: string }
>;
export class MultiEntityDescendantsRoute extends Route<MultiEntityDescendantsRequest> {
  public async buildResponse() {
    const { hierarchyId, entities, fields, field, filter } = this.req.ctx;
    const { includeRootEntity: includeRootEntityString = 'false' } = this.req.query;
    const includeRootEntity = includeRootEntityString?.toLowerCase() === 'true';
    const descendants = await this.req.models.entity.getDescendantsOfEntities(
      hierarchyId,
      entities.map(entity => entity.id),
      { ...filter },
    );
    const entitiesToUse = includeRootEntity ? entities.concat(descendants) : descendants;

    return formatEntitiesForResponse(this.req.models, this.req.ctx, entitiesToUse, field || fields);
  }
}
