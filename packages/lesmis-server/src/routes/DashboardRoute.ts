/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import { TranslatableRoute } from '@tupaia/server-boilerplate';
import { WebConfigConnection } from '../connections';
import { LESMIS_PROJECT_NAME } from '../constants';

export class DashboardRoute extends TranslatableRoute {
  private readonly webConfigConnection: WebConfigConnection;
  translationSubGroup = 'dashboards';

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.webConfigConnection = new WebConfigConnection(req.session);
    this.translationKeys = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          dashboardName: {
            type: 'string'
          },
        }
      }
    };
  }

  async buildResponse() {
    const { entityCode } = this.req.params;
    const response = await this.webConfigConnection.fetchDashboard({
      organisationUnitCode: entityCode,
      projectCode: LESMIS_PROJECT_NAME,
    });
    // Covid dashboard is not needed in lesmis but we want to keep it in tupaia
    // see https://github.com/beyondessential/tupaia-backlog/issues/3077 for more information
    return response
      .filter((dashboard: any) => dashboard.dashboardCode !== 'LA_COVID')
      .map((dashboard: any) => {
        const items = dashboard.items.filter((item: any) => !item.legacy);
        return { ...dashboard, items };
      });
  }
}
