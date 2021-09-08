/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

import { DashboardVisualisationObject } from '../viz-builder';

export type ExportDashboardVisualisationRequest = Request<
  Record<string, never>,
  { contents: DashboardVisualisationObject; filePath: string; type: string },
  { visualisation: DashboardVisualisationObject },
  Record<string, never>
>;

export class ExportDashboardVisualisationRoute extends Route<ExportDashboardVisualisationRequest> {
  protected readonly type = 'download';

  async buildResponse() {
    const { visualisation } = this.req.body;
    const fileBaseName = visualisation.code || 'new_dashboard_visualisation';

    return {
      contents: visualisation,
      filePath: `${fileBaseName}.json`,
      type: '.json',
    };
  }
}
