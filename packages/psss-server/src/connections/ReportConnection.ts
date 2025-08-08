import { convertPeriodStringToDateRange } from '@tupaia/utils';
import { PSSS_HIERARCHY } from '../constants';
import { TupaiaApiClient } from '@tupaia/api-client';

const buildEmptyReport = (periods: string[]) => ({
  results: [],
  metadata: { dataElementCodeToName: {} },
  period: {
    requested: periods.join(';'),
    earliestAvailable: null,
    latestAvailable: null,
  },
});

type ReportObject = {
  results: Record<string, unknown>[];
};

/**
 * Wrapper around the ReportApi
 */
export class ReportConnection {
  private readonly reportApi: TupaiaApiClient['report'];

  public constructor(reportApi: TupaiaApiClient['report']) {
    this.reportApi = reportApi;
  }

  public async fetchReport(
    reportCode: string,
    orgUnitCodes: string[],
    periods: string[] = [],
  ): Promise<ReportObject> {
    if (!orgUnitCodes) {
      throw new Error('No organisationUnitCodes provided');
    }

    if (orgUnitCodes.length === 0) {
      return buildEmptyReport(periods);
    }

    const [startWeek, endWeek = startWeek] = periods;
    const [startDate] = convertPeriodStringToDateRange(startWeek);
    const [, endDate] = convertPeriodStringToDateRange(endWeek);

    return this.reportApi.fetchReport(reportCode, {
      organisationUnitCodes: orgUnitCodes.join(','),
      startDate,
      endDate,
      hierarchy: PSSS_HIERARCHY,
    });
  }
}
