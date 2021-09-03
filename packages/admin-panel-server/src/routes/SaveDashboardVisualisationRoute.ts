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
  draftDashboardItemValidator,
  draftReportValidator,
} from '../viz-builder';

export type SaveDashboardVisualisationRequest = Request<
  { dashboardVisualisationId?: string },
  { id: string; message: string },
  { visualisation?: Record<string, unknown> },
  Record<string, never>
>;

export class SaveDashboardVisualisationRoute extends Route<SaveDashboardVisualisationRequest> {
  private readonly meditrakConnection: MeditrakConnection;

  constructor(req: SaveDashboardVisualisationRequest, res: Response, next: NextFunction) {
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
      draftDashboardItemValidator,
      draftReportValidator,
    );
    const body = extractor.getDashboardVisualisationResource();

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
