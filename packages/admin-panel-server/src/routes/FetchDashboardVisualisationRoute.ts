/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';

import { Route } from '@tupaia/server-boilerplate';

import { MeditrakConnection } from '../connections';
import { combineVisualisation, DashboardViz } from '../viz-builder';

export type FetchDashboardVisualisationRequest = Request<
  { dashboardVisualisationId: string },
  { visualisation: DashboardViz },
  Record<string, never>,
  Record<string, never>
>;

export class FetchDashboardVisualisationRoute extends Route<FetchDashboardVisualisationRequest> {
  private readonly meditrakConnection: MeditrakConnection;

  constructor(req: FetchDashboardVisualisationRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  async buildResponse() {
    const { dashboardVisualisationId } = this.req.params;
    const visualisationResource = await this.meditrakConnection.fetchResources(
      `dashboardVisualisations/${dashboardVisualisationId}`,
    );
    const visualisation = combineVisualisation(visualisationResource);

    return { visualisation };
  }
}
