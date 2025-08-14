import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebEntitySearchRequest, Entity } from '@tupaia/types';
import { camelcaseKeys } from '@tupaia/tsutils';
import { generateFrontendExcludedFilter } from '../utils';

const DEFAULT_FIELDS = ['code', 'name', 'qualified_name'];

export type EntitySearchRequest = Request<
  TupaiaWebEntitySearchRequest.Params,
  TupaiaWebEntitySearchRequest.ResBody,
  TupaiaWebEntitySearchRequest.ReqBody,
  TupaiaWebEntitySearchRequest.ReqQuery
>;
export class EntitySearchRoute extends Route<EntitySearchRequest> {
  public async buildResponse() {
    const { query, params, ctx, models, accessPolicy } = this.req;
    const { projectCode } = params;
    const { searchString, page = 0, pageSize = 5, fields = DEFAULT_FIELDS } = query;

    const frontendExcludedFilter = await generateFrontendExcludedFilter(
      models,
      accessPolicy,
      projectCode,
    );

    const entitySearch: Entity[] = await ctx.services.entity.entitySearch(
      projectCode,
      searchString,
      {
        filter: frontendExcludedFilter,
        ...query,
        page,
        pageSize,
        fields,
      },
    );

    return camelcaseKeys(entitySearch, { deep: true });
  }
}
