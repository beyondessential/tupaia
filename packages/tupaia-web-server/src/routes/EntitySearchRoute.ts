/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebEntitySearchRequest } from '@tupaia/types';
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
    const { query, params, ctx } = this.req;
    const { projectCode } = params;
    const { searchString, page = 0, pageSize = 5, fields = DEFAULT_FIELDS } = query;

    const project = (
      await ctx.services.central.fetchResources('projects', {
        filter: { code: projectCode },
        columns: ['config'],
      })
    )[0];
    const { config } = project;

    return ctx.services.entity.entitySearch(projectCode, searchString, {
      filter: generateFrontendExcludedFilter(config),
      ...query,
      page,
      pageSize,
      fields,
    });
  }
}
