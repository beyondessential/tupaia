/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';

import { Route } from '@tupaia/server-boilerplate';

import { CentralConnection } from '../../connections';
import { combineDashboardVisualisation, DashboardViz } from '../../viz-builder';

export type FetchDashboardVisualisationRequest = Request<
  { dashboardVisualisationId: string },
  { visualisation: DashboardViz },
  Record<string, never>,
  Record<string, never>
>;

export class FetchDashboardVisualisationRoute extends Route<FetchDashboardVisualisationRequest> {
  private readonly centralConnection: CentralConnection;

  public constructor(req: FetchDashboardVisualisationRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.centralConnection = new CentralConnection(req.session);
  }

  public async buildResponse() {
    const { dashboardVisualisationId } = this.req.params;
    const visualisationResource = await this.centralConnection.fetchResources(
      `dashboardVisualisations/${dashboardVisualisationId}`,
    );
    const visualisation = combineDashboardVisualisation(visualisationResource);

    return { visualisation };
  }
}
