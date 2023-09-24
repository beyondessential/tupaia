/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import camelcaseKeys from 'camelcase-keys';
import { TupaiaWebEntitiesRequest } from '@tupaia/types';
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
const parseFilter = (filter: Record<string, any>) =>
  Object.entries(filter).reduce((newFilter, [key, value]) => {
    const parser = FILTER_PARSERS[key as keyof typeof FILTER_PARSERS];
    return { ...newFilter, [key]: parser ? parser(value) : value };
  }, {});

export class EntitiesRoute extends Route<EntitiesRequest> {
  public async buildResponse() {
    const { params, query, ctx, models } = this.req;
    const { rootEntityCode, projectCode } = params;
    const { filter = DEFAULT_FILTER, fields = DEFAULT_FIELDS } = query;
    const formattedFilter = parseFilter(filter);

    const project = (
      await ctx.services.central.fetchResources('projects', {
        filter: { code: projectCode },
        columns: ['config'],
      })
    )[0];
    const { config } = project;

    const { typesExcludedFromWebFrontend } = models.entity;

    const flatEntities = await ctx.services.entity.getDescendantsOfEntity(
      projectCode,
      rootEntityCode,
      {
        filter: {
          ...generateFrontendExcludedFilter(config, typesExcludedFromWebFrontend),
          ...formattedFilter,
        },
        fields,
      },
      query.includeRootEntity || false,
    );

    // The child_codes list won't have been filtered for frontendExcludedTypes
    // Since we fetch two layers at a time, we can clean up child_codes in the
    // first layer, by checking the child exists in the second
    const formattedEntities = flatEntities.map((entity: any) => {
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
