/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { PERIOD_TYPES } from '@tupaia/utils';
import { AGGREGATION_TYPES } from '../../aggregationTypes';

export const aggregateAnalytics = (analytics, aggregationType, aggregationConfig = {}) => {
  const { DAY, WEEK, MONTH, YEAR } = PERIOD_TYPES;

  switch (aggregationType) {
    case AGGREGATION_TYPES.MOST_RECENT:
    default:
      return analytics;
  }
};
