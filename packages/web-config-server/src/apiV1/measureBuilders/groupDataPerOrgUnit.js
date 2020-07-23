/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { SumPerOrgUnitBuilder } from './sumPerOrgUnit';
import { mapMeasureValuesToGroups } from './helpers';

// Don't use this measurebuilder, use 'groupData' instead.
// Ideally would remove this measureBuilder entirely
export const groupSumDataPerOrgUnit = async (
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig = {},
  entity,
) => {
  const builder = new SumPerOrgUnitBuilder(
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
    entity,
    measureBuilderConfig.aggregationType,
  );
  const responseObject = await builder.build();

  const groupedData = responseObject.map(dataElement =>
    mapMeasureValuesToGroups(dataElement, query.dataElementCode, measureBuilderConfig.groups),
  );
  return groupedData;
};
