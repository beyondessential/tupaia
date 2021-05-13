/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Route } from '../Route';

const REPORT_BY_STATUS = {
  archived: 'PSSS_Archived_Alerts',
  active: 'PSSS_Active_Alerts',
};

type Status = keyof typeof REPORT_BY_STATUS;

function validateStatus(status: string): asserts status is Status {
  const statuses = Object.keys(REPORT_BY_STATUS);
  if (!statuses.includes(status)) {
    throw new Error(`Invalid alert status ${status}, must be one of ${statuses}`);
  }
}

export class FetchAlertsRoute extends Route {
  async buildResponse() {
    const { startWeek, endWeek, orgUnitCodes } = this.req.query;
    const { status } = this.req.params;

    validateStatus(status);
    const reportCode = REPORT_BY_STATUS[status];

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
