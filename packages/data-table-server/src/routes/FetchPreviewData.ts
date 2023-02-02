/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { DataTableType } from '../models';

export type FetchPreviewDataRequest = Request<
  Record<string, unknown>,
  { data: unknown[] },
  DataTableType,
  Record<string, unknown>
>;

export class FetchPreviewDataRoute extends Route<FetchPreviewDataRequest> {
  public async buildResponse() {
    const { body, ctx } = this.req;

    const requestParams = { ...body };
    const data = await ctx.dataTableService.fetchData(requestParams);
    return { data };
  }
}
