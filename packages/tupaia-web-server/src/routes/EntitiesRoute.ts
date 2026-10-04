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
    comparisonValue: parseInt(filterVal),
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

    // A bare single-id lookup is a QR scan. Capture it to fall back to a code
    // lookup if the id doesn't resolve within the project (see below).
    const scannedId = typeof restOfFilter.id === 'string' ? restOfFilter.id : undefined;

    const frontendExcludedFilter = await generateFrontendExcludedFilter(
      models,
      accessPolicy,
      projectCode,
      type,
    );

    let flatEntities = await ctx.services.entity.getDescendantsOfEntity(
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

    // Printed QR codes encode an entity's pre-epic id. Sub-country entities are now
    // duplicated per project, and each project's copy has a new id sharing the old
    // `code`, so scanning finds nothing in projects where the entity was duplicated.
    // Resolve the scanned id → code (the canonical row is still on central) and
    // re-query by code to pick up the project's copy. Gated on an empty result so
    // in-project scans stay zero-behaviour-change.
    if (flatEntities.length === 0 && scannedId && !('code' in restOfFilter)) {
      // Non-throwing lookup: a genuinely-invalid scan should surface as an empty
      // result, not a 500.
      const entity = await models.entity.findById(scannedId);
      const code = entity?.code;
      if (code) {
        const { id: _omit, ...filterWithoutId } = restOfFilter;
        flatEntities = await ctx.services.entity.getDescendantsOfEntity(
          projectCode,
          rootEntityCode,
          {
            filter: {
              ...filterWithoutId,
              code,
              ...frontendExcludedFilter,
            },
            fields,
          },
          query.includeRootEntity || false,
        );
      }
    }

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
