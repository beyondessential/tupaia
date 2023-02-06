/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { DataTableType } from '../models';

export type FetchPreviewDataRequest = Request<
  Record<string, unknown>,
  { rows: unknown[]; columns: unknown[] },
  DataTableType,
  Record<string, unknown>
>;

export class FetchPreviewDataRoute extends Route<FetchPreviewDataRequest> {
  public async buildResponse() {
    const { body, ctx } = this.req;

    const requestParams = { ...body };
    const data = await ctx.dataTableService.fetchData(requestParams);
    let columnArray = new Set();
    for (const row of data) {
      if (typeof row === 'object' && row) {
        columnArray = new Set([...columnArray, ...Object.keys(row).map(key => key)]);
      }
    }

    return { rows: data, columns: Array.from(columnArray) };
  }
}
