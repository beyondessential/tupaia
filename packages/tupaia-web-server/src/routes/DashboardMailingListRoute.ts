/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebDashboardMailingListRequest } from '@tupaia/types';

export type DashboardMailingListRequest = Request<
  TupaiaWebDashboardMailingListRequest.Params,
  TupaiaWebDashboardMailingListRequest.ResBody,
  TupaiaWebDashboardMailingListRequest.ReqBody,
  TupaiaWebDashboardMailingListRequest.ReqQuery
>;

export class DashboardMailingListRoute extends Route<DashboardMailingListRequest> {
  public async buildResponse() {
    const { ctx } = this.req;
    return ctx.services.central.fetchResources('dashboardMailingList/:email');
  }
}
