import { aggregateOperationalFacilityValues, getFacilityStatuses, limitRange } from '/apiV1/utils';

// % of clinics that have these items
// % based on facilities surveys
export const percentChildrenDataElement = async ({ dataBuilderConfig, query }, aggregator) => {
  const { dataElementCodes, dataServices, labels = {}, range } = dataBuilderConfig;
  const { results, metadata, period } = await aggregator.fetchAnalytics(
    dataElementCodes,
    { dataServices },
    query,
  );

  // Get count of each percentage found in facilities with same dataElement
  const summedValuesByElement = {};
  const { dataElementCodeToName } = metadata;
  const addValueToSumByElement = ({ dataElement: dataElementCode, value }) => {
    if (!summedValuesByElement[dataElementCode]) {
      summedValuesByElement[dataElementCode] = { sum: 0, count: 0 };
    }
    if (value > 0) {
      // Sum up only elements with value 1 (available) or 2 (available but expired)
      summedValuesByElement[dataElementCode].sum++;
    }
    // And count every operational facility in the total to get the percentage
    summedValuesByElement[dataElementCode].count++;
  };

  // Get the number of operational facilities that has each dataElement
  const operationalFacilities = await getFacilityStatuses(
    aggregator,
    query.organisationUnitCode,
    period,
  );
  aggregateOperationalFacilityValues(operationalFacilities, results, addValueToSumByElement);

  // Return each proportion of all operational facilities for each dataElement
  return {
    data: Object.keys(dataElementCodeToName)
      .map(dataElementCode => ({
        name: labels[dataElementCode] || dataElementCodeToName[dataElementCode],
        value: summedValuesByElement[dataElementCode]
          ? summedValuesByElement[dataElementCode].sum /
            summedValuesByElement[dataElementCode].count
          : 0.0,
      }))
      .map(({ name, value }) => ({ name, value: range ? limitRange(value, range) : value }))
      .sort((one, two) => {
        if (one.name < two.name) return -1;
        if (one.name > two.name) return 1;
        return 0;
      }),
  };
};
