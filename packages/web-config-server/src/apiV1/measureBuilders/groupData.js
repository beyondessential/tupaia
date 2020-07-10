/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { mapMeasureValuesToGroups, mapMeasureDataToCountries } from './helpers';
import { getMeasureBuilder } from './getMeasureBuilder';

export const groupData = async (aggregator, dhisApi, query, measureBuilderConfig = {}, entity) => {
  const { measureBuilder: builderName, mapDataToCountries } = measureBuilderConfig;
  const { dataElementCode } = query;

  const ungroupedData = await getMeasureBuilder(builderName)(
    aggregator,
    dhisApi,
    query,
    measureBuilderConfig.measureBuilderConfig,
    entity,
  );

  const groupedData = ungroupedData.map(dataElement =>
    mapMeasureValuesToGroups(dataElement, dataElementCode, measureBuilderConfig.groups),
  );

  if (mapDataToCountries) return mapMeasureDataToCountries(groupedData);

  return groupedData;
};
