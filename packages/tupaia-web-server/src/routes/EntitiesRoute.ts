import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebEntitiesRequest, Entity } from '@tupaia/types';
import { camelcaseKeys } from '@tupaia/tsutils';
import { generateFrontendExcludedFilter } from '../utils';

export type EntitiesRequest = Request<
  TupaiaWebEntitiesRequest.Params,
  TupaiaWebEntitiesRequest.ResBody,
  TupaiaWebEntitiesRequest.ReqBody,
  TupaiaWebEntitiesRequest.ReqQuery
>;

const getSnakeCase = (value?: string) => {
  return value
    ?.split(/\.?(?=[A-Z])/)
    .join('_')
    .toLowerCase();
};

const DEFAULT_FILTER = {
  generational_distance: 2,
};

const DEFAULT_FIELDS = ['parent_code', 'code', 'name', 'type', 'child_codes'];

const FILTER_PARSERS = {
  type: (entityType: string) => {
    return (Array.isArray(entityType) ? entityType : [entityType])
      .filter(type => !!type)
      .map((type: string) => getSnakeCase(type))
      .join(',');
  },
  generational_distance: (filterVal: string) => ({
    comparator: '<=',
    comparisonValue: Number.parseInt(filterVal),
  }),
};
const parseFilter = (filter: Record<string, any>): Record<string, any> =>
  Object.entries(filter).reduce((newFilter, [key, value]) => {
    const parser = FILTER_PARSERS[key as keyof typeof FILTER_PARSERS];
    return { ...newFilter, [key]: parser ? parser(value) : value };
  }, {});

export class EntitiesRoute extends Route<EntitiesRequest> {
  public async buildResponse() {
    const { params, query, ctx, models, accessPolicy } = this.req;
    const { rootEntityCode, projectCode } = params;
    const { filter = DEFAULT_FILTER, fields = DEFAULT_FIELDS } = query;
    const { type, ...restOfFilter } = parseFilter(filter);

    const frontendExcludedFilter = await generateFrontendExcludedFilter(
      models,
      accessPolicy,
      projectCode,
      type,
    );

    const flatEntities = await ctx.services.entity.getDescendantsOfEntity(
      projectCode,
      rootEntityCode,
      {
        filter: {
          ...restOfFilter,
          ...frontendExcludedFilter, // this needs to be after the filter so that if there is a type filter it will be overwritten by the frontendExcludedFilter so the user can't see the types they shouldn't
        },
        fields,
      },
      query.includeRootEntity || false,
    );

    // The child_codes list won't have been filtered for frontendExcludedTypes
    // Since we fetch two layers at a time, we can clean up child_codes in the
    // first layer, by checking the child exists in the second
    const formattedEntities: Entity[] = flatEntities.map((entity: any) => {
      // Only the first layer
      if (entity.parent_code !== rootEntityCode) {
        return entity;
      }
      const filteredChildren = entity.child_codes?.filter((childCode: string) =>
        flatEntities.some(({ code }: { code: string }) => code === childCode),
      );
      return {
        ...entity,
        child_codes: filteredChildren?.length > 0 ? filteredChildren : undefined,
      };
    });

    return camelcaseKeys(formattedEntities, { deep: true });
  }
}
