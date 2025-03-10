import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

export type FetchDataTableBuiltInParamsRequest = Request<
  Record<string, unknown>,
  Record<string, unknown>,
  Record<string, unknown>,
  { dataTableType: string }
>;

export class FetchDataTableBuiltInParamsRoute extends Route<FetchDataTableBuiltInParamsRequest> {
  public async buildResponse() {
    const { dataTableType } = this.req.query;

    return this.req.ctx.services.dataTable.getBuiltInParameters(dataTableType);
  }
}
