import { Aggregator as BaseAggregator } from '@tupaia/aggregator';
import { getDefaultPeriod } from '@tupaia/utils';

export class Aggregator extends BaseAggregator {
  async fetchAnalytics(
    dataElementCodes: string[],
    organisationUnitCodes: string[],
    period = getDefaultPeriod(),
  ) {
    return super.fetchAnalytics(
      dataElementCodes,
      { organisationUnitCodes, period, dataServices: [{ isDataRegional: true }] },
      { aggregationType: 'RAW' },
    );
  }

  async fetchEvents(
    programCode: string,
    organisationUnitCodes: string[],
    period = getDefaultPeriod(),
  ): Promise<unknown[]> {
    return super.fetchEvents(
      programCode,
      {
        organisationUnitCodes,
        period,
        dataServices: [{ isDataRegional: true }],
        useDeprecatedApi: false,
      },
      { aggregationType: 'RAW' },
    );
  }
}
