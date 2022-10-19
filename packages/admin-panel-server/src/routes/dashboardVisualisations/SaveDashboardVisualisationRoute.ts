/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

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
  public async buildResponse() {
    const { visualisation } = this.req.body;
    const { dashboardVisualisationId } = this.req.params;
    const { central: centralApi } = this.req.ctx.services;

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
      result = await centralApi.updateResource(
        `dashboardVisualisations/${dashboardVisualisationId}`,
        {},
        body,
      );
    } else {
      result = await centralApi.createResource('dashboardVisualisations', {}, body);
    }

    return {
      id: dashboardVisualisationId || result.dashboardItem?.id,
      message: 'Visualisation saved successfully',
    };
  }
}
