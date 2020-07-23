/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { mapMeasureValuesToGroups, mapMeasureDataToCountries } from './helpers';
import { getMeasureBuilder } from './getMeasureBuilder';

export const groupData = async (aggregator, dhisApi, query, measureBuilderConfig = {}, entity) => {
  const { measureBuilder: builderName, mapDataToCountries } = measureBuilderConfig;
  const { dataElementCode } = query;

  const { data: ungroupedData, period } = await getMeasureBuilder(builderName)(
    aggregator,
    dhisApi,
    query,
    measureBuilderConfig.measureBuilderConfig,
    entity,
  );

  const groupedData = ungroupedData.map(dataElement =>
    mapMeasureValuesToGroups(dataElement, dataElementCode, measureBuilderConfig.groups),
  );

  const returnData = mapDataToCountries
    ? await mapMeasureDataToCountries(groupedData)
    : groupedData;

  return { data: returnData, period };
};
