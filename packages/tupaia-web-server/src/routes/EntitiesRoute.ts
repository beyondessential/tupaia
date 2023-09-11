/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import camelcaseKeys from 'camelcase-keys';
import { TupaiaWebEntitiesRequest, Entity } from '@tupaia/types';
import { generateFrontendExcludedFilter } from '../utils';

export type EntitiesRequest = Request<
  TupaiaWebEntitiesRequest.Params,
  TupaiaWebEntitiesRequest.ResBody,
  TupaiaWebEntitiesRequest.ReqBody,
  TupaiaWebEntitiesRequest.ReqQuery
>;

const DEFAULT_FILTER = {
  generational_distance: {
    comparator: '<=',
    comparisonValue: 2,
  },
};

const DEFAULT_FIELDS = ['parent_code', 'code', 'name', 'type', 'child_codes'];

export class EntitiesRoute extends Route<EntitiesRequest> {
  public async buildResponse() {
    const { params, query, ctx, models } = this.req;
    const { rootEntityCode, projectCode } = params;

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
          ...DEFAULT_FILTER,
          ...generateFrontendExcludedFilter(config, typesExcludedFromWebFrontend),
        },
        fields: DEFAULT_FIELDS,
        ...query,
      },
      query.includeRootEntity || false,
    );

    // The child_codes aren't filtered for frontendExcludedTypes
    // So we fetch a layer of filtered descendents and 
    const childEntities = await ctx.services.entity.getDescendantsOfEntities(
      projectCode,
      flatEntities.map((e: any) => e.code),
      {
        filter: {
          generational_distance: {
            comparator: '<=',
            comparisonValue: 1,
          },
          ...generateFrontendExcludedFilter(config, typesExcludedFromWebFrontend),
        },
        fields: ['code'],
      },
    );
    const formattedEntities = flatEntities.map((e: any) => {
      const filteredChildren = e.child_codes?.filter((code: string) =>
        childEntities.some((ce: any) => ce.code === code),
      );
      return {
        ...e,
        child_codes: filteredChildren?.length > 0 ? filteredChildren : undefined,
      };
    });

    return camelcaseKeys(formattedEntities, { deep: true });
  }
}
