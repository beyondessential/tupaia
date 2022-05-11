/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';

import { Route } from '@tupaia/server-boilerplate';

import { CentralConnection } from '../../connections';
import {
  DashboardVisualisationExtractor,
  draftDashboardItemValidator,
  draftReportValidator,
} from '../../viz-builder';

export type SaveDashboardVisualisationRequest = Request<
  { dashboardVisualisationId?: string },
  { id: string; message: string },
  { visualisation?: Record<string, unknown> },
  Record<string, never>
>;

export class SaveDashboardVisualisationRoute extends Route<SaveDashboardVisualisationRequest> {
  private readonly centralConnection: CentralConnection;

  public constructor(req: SaveDashboardVisualisationRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.centralConnection = new CentralConnection(req.session);
  }

  public async buildResponse() {
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
      result = await this.centralConnection.updateResource(
        `dashboardVisualisations/${dashboardVisualisationId}`,
        {},
        body,
      );
    } else {
      result = await this.centralConnection.createResource('dashboardVisualisations', {}, body);
    }

    return {
      id: dashboardVisualisationId || result.dashboardItem?.id,
      message: 'Visualisation saved successfully',
    };
  }
}
