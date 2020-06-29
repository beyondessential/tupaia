import flattenDeep from 'lodash.flattendeep';
import { OPERATOR_TO_VALUE_CHECK } from '/apiV1/dataBuilders/helpers/checkAgainstConditions';

export const composePercentageInGroupByDataClass = async (
  { dataBuilderConfig, query },
  aggregator,
) => {
  const { dataClasses, dataServices, groups, labels = {}, filter = {} } = dataBuilderConfig;
  const dataElementCodes = flattenDeep(Object.values(dataClasses).map(({ codes }) => codes));
  const { results, metadata } = await aggregator.fetchAnalytics(
    dataElementCodes,
    { dataServices },
    query,
    { filter, aggregationType: aggregator.aggregationTypes.MOST_RECENT_PER_ORG_GROUP },
  );

  const groupMap = Object.keys(groups).reduce((acc, cur) => {
    acc[cur] = 0;
    return acc;
  }, {});

  const dataCodesToIds = [];
  Object.keys(dataClasses).forEach(id => {
    const codesForDataClass = dataClasses[id].codes;
    codesForDataClass.forEach(code => {
      dataCodesToIds[code] = id;
    });
  });

  const summedValuesByElement = {};
  const orgUnitCount = new Set(results.map(res => res.organisationUnit)).size;

  results.map(({ dataElement, value }) => {
    const group = mapValueGroup(value, groups);
    const dataClassId = dataCodesToIds[dataElement];
    const divisor = orgUnitCount * dataClasses[dataClassId].codes.length;
    if (!summedValuesByElement[dataClassId]) {
      summedValuesByElement[dataClassId] = { ...groupMap };
    }
    summedValuesByElement[dataClassId][group] += 1 / divisor;
  });

  const { dataElementCodeToName } = metadata;
  const data = Object.keys(dataClasses).map(id => ({
    name: labels[id] || dataElementCodeToName[id],
    ...summedValuesByElement[id],
  }));

  return {
    data: data,
  };
};

export const mapValueGroup = (value, groups) => {
  const group = Object.entries(groups).find(([groupName, groupConfig]) => {
    const groupCheck = OPERATOR_TO_VALUE_CHECK[groupConfig.operator];
    if (!groupCheck) {
      throw new Error(`No function defined for operator: ${groupConfig.operator}`);
    }
    return groupCheck(value, groupConfig.value);
  });
  return group ? group[0] : value;
};
