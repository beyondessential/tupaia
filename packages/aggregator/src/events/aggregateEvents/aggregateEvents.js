/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AGGREGATION_TYPES } from '../../aggregationTypes';
import { replaceOrgUnitWithOrgGroup, replaceEntityAnswerWithEntityName } from './aggregations';

export const aggregateEvents = (
  events,
  aggregationType = AGGREGATION_TYPES.RAW,
  aggregationConfig = {},
) => {
  switch (aggregationType) {
    case AGGREGATION_TYPES.REPLACE_ORG_UNIT_WITH_ORG_GROUP:
      return replaceOrgUnitWithOrgGroup(events, aggregationConfig);
    case AGGREGATION_TYPES.REPLACE_ENTITY_ANSWER_WITH_ENTITY_NAME:
      return replaceEntityAnswerWithEntityName(events, aggregationConfig);
    case AGGREGATION_TYPES.RAW:
      return events;
    default:
      throw new Error('Aggregation type not found');
  }
};
