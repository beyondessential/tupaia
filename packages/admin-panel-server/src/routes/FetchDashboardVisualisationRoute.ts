/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';

import { Route } from '@tupaia/server-boilerplate';

import { MeditrakConnection } from '../connections';
import { DashboardVisualisationCombiner } from '../viz-builder';

export class FetchDashboardVisualisationRoute extends Route {
  private readonly meditrakConnection: MeditrakConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  async buildResponse() {
    const { dashboardVisualisationId } = this.req.params;
    const { dashboardItem, report } = await this.meditrakConnection.fetchResources(
      `dashboardVisualisations/${dashboardVisualisationId}`,
    );

    const extractor = new DashboardVisualisationCombiner(
      dashboardItem,
      report,
    );
    const visualisation = extractor.getVisualisation();

    return {
      visualisation,
    };
  }
}
