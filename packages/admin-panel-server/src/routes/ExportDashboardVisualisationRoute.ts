/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Route } from '@tupaia/server-boilerplate';

export class ExportDashboardVisualisationRoute extends Route {
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
