import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

export type FetchDataRequest = Request<
  { dataTableCode: string },
  { data: unknown[] },
  Record<string, unknown>,
  Record<string, unknown>
>;

export class FetchDataRoute extends Route<FetchDataRequest> {
  public async buildResponse() {
    const { body, ctx } = this.req;

    const requestParams = { ...body };
    const data = await ctx.dataTableService.fetchData(requestParams);
    return { data };
  }
}
