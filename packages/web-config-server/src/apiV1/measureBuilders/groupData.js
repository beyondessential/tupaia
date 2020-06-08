/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { mapMeasureValuesToGroups } from './helpers';
import { getMeasureBuilder } from './getMeasureBuilder';

export const groupData = async (aggregator, dhisApi, query, measureBuilderConfig = {}, entity) => {
  const builderName = measureBuilderConfig.measureBuilder;
  const ungroupedData = await getMeasureBuilder(builderName)(
    aggregator,
    dhisApi,
    query,
    measureBuilderConfig.measureBuilderConfig,
    entity,
  );

  const groupedData = ungroupedData.map(dataElement =>
    mapMeasureValuesToGroups(dataElement, query.dataElementCode, measureBuilderConfig.groups),
  );
  return groupedData;
};
