/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SessionHandlingApiConnection } from './SessionHandlingApiConnection';

const { REPORT_API_URL = 'http://localhost:8030/v2' } = process.env;

type ReportObject = {
  results: Record<string, unknown>[];
};
export class ReportConnection extends SessionHandlingApiConnection {
  baseUrl = REPORT_API_URL;

  getDefaultCredentials() {
    const {
      MICROSERVICE_CLIENT_USERNAME: username,
      MICROSERVICE_CLIENT_PASSWORD: password,
    } = process.env;
    if (!username || !password) {
      throw new Error(
        'Default credentials for ReportConnection must be defined as environment variables',
      );
    }
    return { username, password };
  }

  async fetchReport(
    reportCode: string,
    orgUnitCodes: string[],
    periods: string[] = [],
  ): Promise<ReportObject> {
    if (!orgUnitCodes || !orgUnitCodes.length) {
      throw new Error('No organisationUnitCodes provided');
    }

    return this.get(`fetchReport/${reportCode}`, {
      organisationUnitCodes: orgUnitCodes.join(','),
      period: periods.join(';'),
    });
  }
}
