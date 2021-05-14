/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Route } from '../Route';

const CATEGORY_TO_REPORT = {
  archive: 'PSSS_Archived_Alerts',
  active: 'PSSS_Active_Alerts',
};

type AlertCategory = keyof typeof CATEGORY_TO_REPORT;

function validateStatus(category: string): asserts category is AlertCategory {
  const categories = Object.keys(CATEGORY_TO_REPORT);
  if (!categories.includes(category)) {
    throw new Error(`Invalid alert category '${category}', must be one of ${categories}`);
  }
}

export class FetchAlertsRoute extends Route {
  async buildResponse() {
    const { startWeek, endWeek, orgUnitCodes } = this.req.query;
    const { category } = this.req.params;

    validateStatus(category);
    const reportCode = CATEGORY_TO_REPORT[category];

    const reportData = await this.reportConnection?.fetchReport(
      reportCode,
      orgUnitCodes?.split(','),
      [startWeek, endWeek],
    );

    return {
      startWeek,
      endWeek,
      data: reportData,
    };
  }
}
