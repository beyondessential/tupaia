/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

import { combineDashboardVisualisation, DashboardViz } from '../../viz-builder';

export type FetchDashboardVisualisationRequest = Request<
  { dashboardVisualisationId: string },
  { visualisation: DashboardViz },
  Record<string, never>,
  Record<string, never>
>;

export class FetchDashboardVisualisationRoute extends Route<FetchDashboardVisualisationRequest> {
  public async buildResponse() {
    const { dashboardVisualisationId } = this.req.params;
    const visualisationResource = await this.req.ctx.services.central.fetchResources(
      `dashboardVisualisations/${dashboardVisualisationId}`,
    );
    const visualisation = combineDashboardVisualisation(visualisationResource);

    return { visualisation };
  }
}
