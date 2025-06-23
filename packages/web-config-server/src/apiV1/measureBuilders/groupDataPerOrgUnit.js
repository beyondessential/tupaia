import { SumPerOrgUnitBuilder } from './sumPerOrgUnit';
import { mapMeasureValuesToGroups } from './helpers';

// Don't use this measurebuilder, use 'groupData' instead.
// Ideally would remove this measureBuilder entirely
export const groupSumDataPerOrgUnit = async (
  models,
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig = {},
  entity,
) => {
  const builder = new SumPerOrgUnitBuilder(
    models,
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
    entity,
    measureBuilderConfig.aggregationType,
  );
  const { data: ungroupedData, period } = await builder.build();

  const groupedData = ungroupedData.map(dataElement =>
    mapMeasureValuesToGroups(dataElement, query.dataElementCode, measureBuilderConfig.groups),
  );
  return { data: groupedData, period };
};
