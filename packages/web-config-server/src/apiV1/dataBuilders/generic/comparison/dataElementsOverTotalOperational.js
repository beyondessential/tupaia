import {
  aggregateOperationalFacilityValues,
  getFacilityStatuses,
  getFacilityStatusCounts,
} from '/apiV1/utils';

export const dataElementsOverTotalOperational = async (
  { dataBuilderConfig, query },
  aggregator,
) => {
  const { dataElementCodes, dataServices, labels = {} } = dataBuilderConfig;
  const { results, metadata, period } = await aggregator.fetchAnalytics(
    dataElementCodes,
    { dataServices },
    query,
  );

  // Map all dataElement with summed values of only operational facilities
  const summedValuesByElement = {};
  const { dataElementCodeToName } = metadata;
  const addValueToSumByElement = ({ dataElement: dataElementCode, value }) => {
    if (!summedValuesByElement[dataElementCode]) {
      summedValuesByElement[dataElementCode] = 0;
    }
    // Get the number of operational facilities with dataElement (higher than 0)
    if (value > 0) {
      summedValuesByElement[dataElementCode]++;
    }
  };

  // Will count only operational facilities
  const operationalFacilities = await getFacilityStatuses(
    aggregator,
    query.organisationUnitCode,
    period,
  );
  aggregateOperationalFacilityValues(operationalFacilities, results, addValueToSumByElement);
  const { numberOperational: totalOperationalFacilities } = await getFacilityStatusCounts(
    aggregator,
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
