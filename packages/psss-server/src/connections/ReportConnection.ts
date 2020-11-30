/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ApiConnection } from './ApiConnection';

const { REPORT_API_URL = 'http://localhost:8030/v2' } = process.env;

export class ReportConnection extends ApiConnection {
  baseUrl = REPORT_API_URL;

  async fetchReport(reportCode: string, orgUnitCodes: string[], periods: string[] = []) {
    if (!orgUnitCodes || !orgUnitCodes.length) {
      throw new Error(`No organisationUnitCodes provided`);
    }

    return this.get(`fetchReport/${reportCode}`, {
      organisationUnitCodes: orgUnitCodes.join(','),
      period: periods.join(';'),
    });
  }
}
