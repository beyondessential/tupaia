import flattenDeep from 'lodash.flattendeep';

import { checkValueSatisfiesCondition } from '@tupaia/utils';

export const composePercentageInGroupByDataClass = async (
  { dataBuilderConfig, query },
  aggregator,
) => {
  const {
    dataClasses,
    dataServices,
    groups,
    labels = {},
    filter = {},
    fillPercentGroup = '',
  } = dataBuilderConfig;
  const dataElementCodes = flattenDeep(Object.values(dataClasses).map(({ codes }) => codes));
  const { results, metadata } = await aggregator.fetchAnalytics(
    dataElementCodes,
    { dataServices },
    query,
    { filter, aggregationType: aggregator.aggregationTypes.MOST_RECENT_PER_ORG_GROUP },
  );

  const groupMap = Object.keys(groups).reduce((map, group) => {
    map[group] = 0;
    return map;
  }, {});
  const orgUnitCount =
    new Set(filter.organisationUnit.in).size ||
    new Set(results.map(res => res.organisationUnit)).size;

  const dataCodesToIds = [];
  Object.keys(dataClasses).forEach(id => {
    const codesForDataClass = dataClasses[id].codes;
    codesForDataClass.forEach(code => {
      dataCodesToIds[code] = id;
    });
  });

  const valuesByDataClass = {};
  results.forEach(({ dataElement, value, organisationUnit }) => {
    const dataClassId = dataCodesToIds[dataElement];

    if (!valuesByDataClass[dataClassId]) {
      valuesByDataClass[dataClassId] = {};
    }
    if (!valuesByDataClass[dataClassId][organisationUnit]) {
      valuesByDataClass[dataClassId][organisationUnit] = 0;
    }
    valuesByDataClass[dataClassId][organisationUnit] += value;
  });

  const groupedValuesByDataClass = {};

  Object.keys(valuesByDataClass).forEach(dataClass => {
    groupedValuesByDataClass[dataClass] = {};
    Object.keys(valuesByDataClass[dataClass]).forEach(orgUnit => {
      groupedValuesByDataClass[dataClass][orgUnit] = mapValueGroup(
        valuesByDataClass[dataClass][orgUnit],
        groups,
      );
    });
  });

  const groupedCountsByDataClass = {};
  Object.keys(groupedValuesByDataClass).forEach(dataClass => {
    groupedCountsByDataClass[dataClass] = {};
    Object.keys(groupedValuesByDataClass[dataClass]).forEach(orgUnit => {
      const groupValue = groupedValuesByDataClass[dataClass][orgUnit];
      if (!groupedCountsByDataClass[dataClass][groupValue]) {
        groupedCountsByDataClass[dataClass][groupValue] = 0;
      }
      groupedCountsByDataClass[dataClass][groupValue] += 1;
    });
  });

  const { dataElementCodeToName } = metadata;
  const data = Object.keys(dataClasses).map(id => {
    const dataClassGroups = groupMap;
    Object.keys(dataClassGroups).forEach(group => {
      dataClassGroups[group] = groupedCountsByDataClass[id]
        ? groupedCountsByDataClass[id][group] / orgUnitCount || 0
        : 0;
    });
    if (fillPercentGroup) {
      let totalPercentage = 0;
      Object.keys(dataClassGroups).forEach(group => {
        totalPercentage += dataClassGroups[group];
      });
      dataClassGroups[fillPercentGroup] += 1 - totalPercentage;
    }

    return {
      name: labels[id] || dataElementCodeToName[id],
      ...dataClassGroups,
    };
  });

  return { data };
};

const mapValueGroup = (value, groups) => {
  const group = Object.entries(groups).find(([groupName, groupConfig]) =>
    checkValueSatisfiesCondition(value, groupConfig),
  );
  return group ? group[0] : value;
};
