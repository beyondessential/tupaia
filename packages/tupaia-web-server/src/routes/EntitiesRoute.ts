/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import camelcaseKeys from 'camelcase-keys';
import { TupaiaWebEntitiesRequest } from '@tupaia/types';
import { generateAccessibleCountryFilter, generateFrontendExcludedFilter } from '../utils';

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
        columns: ['config', 'permission_groups'],
      })
    )[0];
    const { permission_groups: permissionGroups, config } = project;

    const { typesExcludedFromWebFrontend } = models.entity;

    const flatEntities = await ctx.services.entity.getDescendantsOfEntity(
      projectCode,
      rootEntityCode,
      {
        filter: {
          ...DEFAULT_FILTER,
          ...generateFrontendExcludedFilter(config, typesExcludedFromWebFrontend),
          ...generateAccessibleCountryFilter(this.req.accessPolicy, permissionGroups),
        },
        fields: DEFAULT_FIELDS,
        ...query,
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
