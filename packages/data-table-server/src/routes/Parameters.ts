/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { DataTableParameter } from '../dataTableService';

export type ParametersRequest = Request<
  { dataTableCode: string },
  { parameters: DataTableParameter[] },
  Record<string, unknown>,
  Record<string, unknown>
>;

export class ParametersRoute extends Route<ParametersRequest> {
  public async buildResponse() {
    return { parameters: this.req.ctx.dataTableService.getParameters() };
  }
}
