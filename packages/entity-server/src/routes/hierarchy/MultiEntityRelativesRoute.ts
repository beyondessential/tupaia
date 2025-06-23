import { Route } from '@tupaia/server-boilerplate';
import { formatEntitiesForResponse } from './format';
import { MultiEntityRequest, MultiEntityRequestParams, EntityResponse } from './types';

export type MultiEntityRelativesRequest = MultiEntityRequest<
  MultiEntityRequestParams,
  EntityResponse[]
>;
export class MultiEntityRelativesRoute extends Route<MultiEntityRelativesRequest> {
  public async buildResponse() {
    const { hierarchyId, entities, fields, field, filter } = this.req.ctx;

    const relatives = await this.req.models.entity.getRelativesOfEntities(
      hierarchyId,
      entities.map(entity => entity.id),
      { ...filter },
    );

    return formatEntitiesForResponse(this.req.models, this.req.ctx, relatives, field || fields);
  }
}
