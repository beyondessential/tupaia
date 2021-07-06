/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { WebConfigConnection } from '../connections';
import { LESMIS_PROJECT_NAME } from '../constants';

export class DashboardRoute extends Route {
  private readonly webConfigConnection: WebConfigConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.webConfigConnection = new WebConfigConnection(req.session);
  }

  async buildResponse() {
    const { entityCode } = this.req.params;
    const response = await this.webConfigConnection.fetchDashboard({
      organisationUnitCode: entityCode,
      projectCode: LESMIS_PROJECT_NAME,
    });
    // Covid dashboard is not needed in lesmis but we want to keep it in tupaia
    // see https://github.com/beyondessential/tupaia-backlog/issues/3077 for more information
    return response.filter((dashboard: any) => dashboard.dashboardCode !== 'LA_COVID');
  }
}
