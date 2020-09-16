/**
 * Reports package
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';
import { createAggregator } from '@tupaia/aggregator';
import { Aggregator } from '../aggregator';

class FetchReportRouteHandler {
  constructor() {
    this.aggregator = createAggregator(Aggregator);
  }

  fetchReport = async (req, res) => {
    const { models, query } = req;
    const { organisationUnitCode, dashboardId, period, projectCode } = query;
    const dashboard = await models.dashboardReport.findById(dashboardId);
    const { dataServices } = dashboard;
    const { dataElementCodes, aggregationType } = dashboard.dataBuilderConfig;
    console.log(dataElementCodes, aggregationType);
    const data = await this.aggregator.fetchAnalytics(
      dataElementCodes,
      { dataServices, organisationUnitCodes: [organisationUnitCode] },
      {},
      {
        aggregationType,
      },
    );

    respond(res, { data });
  };
}

export const fetchReport = new FetchReportRouteHandler().fetchReport;
