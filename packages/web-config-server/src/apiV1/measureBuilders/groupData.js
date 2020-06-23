/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { mapMeasureValuesToGroups } from './helpers';
import { getMeasureBuilder } from './getMeasureBuilder';
import { Entity } from '../../models';

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

  if (mapDataToCountries) {
    const results = [];
    for (const result of groupedData) {
      const resultEntity = await Entity.findOne({ code: result.organisationUnitCode });
      const resultCountry = await resultEntity.countryEntity();
      results.push({ ...result, organisationUnitCode: resultCountry.code });
    }

    return results;
  }

  return groupedData;
};
