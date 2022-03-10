/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, NextFunction } from 'express';
import { TranslatableRoute, TranslatableResponse } from '@tupaia/server-boilerplate';
import { WebConfigConnection } from '../connections';
import { LESMIS_PROJECT_NAME } from '../constants';

export type DashboardRequest = Request<{ entityCode: string }, any, any, any>;

export class DashboardRoute extends TranslatableRoute<
  DashboardRequest,
  TranslatableResponse<DashboardRequest>
> {
  private readonly webConfigConnection: WebConfigConnection;

  constructor(
    req: DashboardRequest,
    res: TranslatableResponse<DashboardRequest>,
    next: NextFunction,
  ) {
    super(req, res, next);

    this.webConfigConnection = new WebConfigConnection(req.session);
    this.translationSchema = {
      domain: 'lesmis',
      layout: {
        type: 'array',
        items: {
          type: 'object',
          valuesToTranslate: ['dashboardName', 'entityName'],
          properties: {
            // Object property named 'items'
            items: {
              type: 'array',
              items: {
                type: 'object',
                // Dashboard item names, and axis names
                valuesToTranslate: ['name', 'xName', 'yName'],
                properties: {
                  chartConfig: {
                    type: 'object',
                    keysToTranslate: '*',
                    properties: {
                      '*': {
                        type: 'object',
                        // For multi-axis visuals
                        valuesToTranslate: ['yName'],
                      },
                    },
                  },
                  presentationOptions: {
                    type: 'object',
                    keysToTranslate: '*',
                  },
                },
              },
            },
          },
        },
      },
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
