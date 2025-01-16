import { mapMeasureValuesToGroups, mapMeasureDataToCountries } from './helpers';
import { getMeasureBuilder } from './getMeasureBuilder';

export const groupData = async (
  models,
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig = {},
  entity,
) => {
  const { measureBuilder: builderName, mapDataToCountries } = measureBuilderConfig;
  const { dataElementCode } = query;

  const { data: ungroupedData, period } = await getMeasureBuilder(builderName)(
    models,
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
    ? await mapMeasureDataToCountries(models, groupedData)
    : groupedData;

  return { data: returnData, period };
};
