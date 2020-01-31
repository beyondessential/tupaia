import {
  aggregateOperationalFacilityValues,
  getFacilityStatuses,
  getFacilityStatusCounts,
} from '/apiV1/utils';

export const dataElementsOverTotalOperational = async (
  { dataBuilderConfig, query },
  aggregator,
  dhisApi,
) => {
  const { labels = {}, ...restOfDataBuilderConfig } = dataBuilderConfig;
  const { results, metadata, period } = await dhisApi.getAnalytics(restOfDataBuilderConfig, query);

  // Map all dataElement with summed values of only operational facilities
  const summedValuesByElement = {};
  const { dataElementIdToCode, dataElementCodeToName } = metadata;
  const addValueToSumByElement = ({ dataElement: dataElementId, value }) => {
    const dataElementCode = dataElementIdToCode[dataElementId];
    if (!summedValuesByElement[dataElementCode]) {
      summedValuesByElement[dataElementCode] = 0;
    }
    // Get the number of operational facilities with dataElement (higher than 0)
    if (value > 0) {
      summedValuesByElement[dataElementCode]++;
    }
  };

  // Will count only operational facilities
  const operationalFacilities = await getFacilityStatuses(query.organisationUnitCode, period);
  aggregateOperationalFacilityValues(operationalFacilities, results, addValueToSumByElement);
  const { numberOperational: totalOperationalFacilities } = await getFacilityStatusCounts(
    query.organisationUnitCode,
    period,
  );

  // Return proportion of operational facilities with each dataElement over total operational facilities
  return {
    data: Object.keys(dataElementCodeToName).map(dataElementCode => {
      return {
        name: labels[dataElementCode] || dataElementCodeToName[dataElementCode],
        value: summedValuesByElement[dataElementCode] || 0,
        total: totalOperationalFacilities,
      };
    }),
  };
};
