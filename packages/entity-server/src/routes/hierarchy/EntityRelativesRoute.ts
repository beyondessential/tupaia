import { Route } from '@tupaia/server-boilerplate';
import { formatEntitiesForResponse } from './format';
import {
  SingleEntityRequest,
  SingleEntityRequestParams,
  RequestBody,
  EntityRequestQuery,
  EntityResponse,
} from './types';

export type RelativesRequest = SingleEntityRequest<
  SingleEntityRequestParams,
  EntityResponse[],
  RequestBody,
  EntityRequestQuery
>;
export class EntityRelativesRoute extends Route<RelativesRequest> {
  public async buildResponse() {
    const { hierarchyId, entity, fields, field, filter } = this.req.ctx;

    const responseEntities = await entity.getRelatives(hierarchyId, filter);

    return formatEntitiesForResponse(
      this.req.models,
      this.req.ctx,
      responseEntities,
      field || fields,
    );
  }
}
