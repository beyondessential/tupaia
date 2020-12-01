/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator as BaseAggregator } from '@tupaia/aggregator';
import { getDefaultPeriod } from '@tupaia/utils';
import { Event } from '../types';

export class Aggregator extends BaseAggregator {
  async fetchAnalytics(
    dataElementCodes: string[],
    organisationUnitCodes: string,
    period = getDefaultPeriod(),
  ) {
    return super.fetchAnalytics(
      dataElementCodes,
      {
        organisationUnitCodes: organisationUnitCodes.split(','),
        period,
        dataServices: [{ isDataRegional: true }],
      },
      { aggregationType: 'RAW' },
    );
  }

  async fetchEvents(
    programCode: string,
    organisationUnitCodes: string,
    period = getDefaultPeriod(),
  ): Promise<Event[]> {
    return super.fetchEvents(
      programCode,
      {
        organisationUnitCodes: organisationUnitCodes.split(','),
        period,
        dataServices: [{ isDataRegional: true }],
        useDeprecatedApi: false,
      },
      { aggregationType: 'RAW' },
    );
  }
}
