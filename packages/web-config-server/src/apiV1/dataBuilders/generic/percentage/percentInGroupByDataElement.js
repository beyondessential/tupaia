import { aggregateOperationalFacilityValues, getFacilityStatuses } from '/apiV1/utils';

// Average Availability of Medicines across All Facilities
// Current Stock on Hand across All Facilities
export const percentInGroupByDataElement = async ({ dataBuilderConfig, query }, aggregator) => {
  const { dataElementCodes, dataServices, labels = {} } = dataBuilderConfig;
  const { results, metadata } = await aggregator.fetchAnalytics(
    dataElementCodes,
    { dataServices },
    query,
  );

  // Map all dataElement with summed values of only operational facilities
  const summedValuesByElement = {};
  const { dataElementCodeToName } = metadata;
  const addValueToSumByElement = ({ dataElement: dataElementCode, value }) => {
    if (!summedValuesByElement[dataElementCode]) {
      summedValuesByElement[dataElementCode] = { sum: 0, count: 0 };
    }
    summedValuesByElement[dataElementCode].sum += value;
    summedValuesByElement[dataElementCode].count++;
  };

  // Will count only operational facilities
  const operationalFacilities = await getFacilityStatuses(aggregator, query.organisationUnitCode);
  aggregateOperationalFacilityValues(operationalFacilities, results, addValueToSumByElement);

  // Return each averaged value of all operational facilities for each data element
  return {
    data: Object.entries(summedValuesByElement).map(([dataElementCode, value]) => ({
      name: labels[dataElementCode] || dataElementCodeToName[dataElementCode],
      value: value.sum / value.count,
    })),
  };
};
