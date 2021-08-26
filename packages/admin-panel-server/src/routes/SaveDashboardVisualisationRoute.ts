/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';

import { Route } from '@tupaia/server-boilerplate';

import { MeditrakConnection } from '../connections';
import {
  DashboardVisualisationExtractor,
  DraftDashboardItemValidator,
  DraftReportValidator,
} from '../viz-builder';

export class SaveDashboardVisualisationRoute extends Route {
  private readonly meditrakConnection: MeditrakConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  async buildResponse() {
    const { visualisation } = this.req.body;
    const { dashboardVisualisationId } = this.req.params;

    if (!visualisation) {
      throw new Error('Visualisation cannot be empty.');
    }

    const extractor = new DashboardVisualisationExtractor(
      visualisation,
      new DraftDashboardItemValidator(),
      new DraftReportValidator(),
    );
    const body = extractor.extractDashboardVisualisationResource();

    let result;

    // Update visualisation if id exists
    if (dashboardVisualisationId) {
      result = await this.meditrakConnection.updateResource(
        `dashboardVisualisations/${dashboardVisualisationId}`,
        {},
        body,
      );
    } else {
      result = await this.meditrakConnection.createResource('dashboardVisualisations', {}, body);
    }

    return {
      id: dashboardVisualisationId || result.dashboardItem?.id,
      message: 'Visualisation saved successfully',
    };
  }
}
