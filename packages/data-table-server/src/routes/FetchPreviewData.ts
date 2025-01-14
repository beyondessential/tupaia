import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { DataTablePreviewRequest } from '@tupaia/types';

export type FetchPreviewDataRequest = Request<
  Record<string, unknown>,
  { rows: unknown[]; columns: unknown[] },
  DataTablePreviewRequest,
  Record<string, unknown>
>;

export class FetchPreviewDataRoute extends Route<FetchPreviewDataRequest> {
  public async buildResponse() {
    const { body, ctx } = this.req;

    const requestParams = { ...body.runtimeParams };
    const { rows, total, limit } = await ctx.dataTableService.fetchPreviewData(requestParams);
    let columnArray = new Set();
    for (const row of rows) {
      if (typeof row === 'object' && row) {
        columnArray = new Set([...columnArray, ...Object.keys(row).map(key => key)]);
      }
    }

    return {
      rows,
      columns: Array.from(columnArray),
      total,
      limit,
    };
  }
}
