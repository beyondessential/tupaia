/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { PERIOD_TYPES } from '@tupaia/utils';
import { AGGREGATION_TYPES } from '../../aggregationTypes';
import { replaceOrgUnitWithOrgGroup } from './aggregations';

// Needs to handle both the new events api and the old one.
export const aggregateEvents = (
  events,
  aggregationType = AGGREGATION_TYPES.RAW,
  aggregationConfig = {},
) => {
  const { DAY, WEEK, MONTH, YEAR } = PERIOD_TYPES;

  switch (aggregationType) {
    case AGGREGATION_TYPES.REPLACE_ORG_UNIT_WITH_ORG_GROUP:
      return replaceOrgUnitWithOrgGroup(events, aggregationConfig);
    case AGGREGATION_TYPES.RAW:
      return events;
    default:
      throw new Error('Aggregation type not found');
  }
};
