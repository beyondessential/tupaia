import { Route } from '@tupaia/server-boilerplate';
import { formatEntitiesForResponse } from './format';
import {
  SingleEntityRequest,
  SingleEntityRequestParams,
  RequestBody,
  EntityRequestQuery,
  EntityResponse,
} from './types';

export type AncestorsRequest = SingleEntityRequest<
  SingleEntityRequestParams,
  EntityResponse[],
  RequestBody,
  EntityRequestQuery & { includeRootEntity?: string }
>;
export class EntityAncestorsRoute extends Route<AncestorsRequest> {
  public async buildResponse() {
    const { hierarchyId, entity, fields, field, filter } = this.req.ctx;
    const { includeRootEntity: includeRootEntityString = 'false' } = this.req.query;
    const includeRootEntity = includeRootEntityString?.toLowerCase() === 'true';
    const ancestors = await entity.getAncestors(hierarchyId, {
      ...filter,
    });
    const responseEntities = includeRootEntity ? [entity].concat(ancestors) : ancestors;

    return formatEntitiesForResponse(
      this.req.models,
      this.req.ctx,
      responseEntities,
      field || fields,
    );
  }
}
