import { aggregateOperationalFacilityValues, getFacilityStatuses } from '/apiV1/utils';

export const achievedVsTargetByGroup = async ({ dataBuilderConfig, query, entity }, aggregator) => {
  const { groups, dataServices } = dataBuilderConfig;
  const dataElementCodes = [];
  groups.forEach(({ achievedDataElementCode, targetDataElementCode }) =>
    dataElementCodes.push(achievedDataElementCode, targetDataElementCode),
  );

  const { results } = await aggregator.fetchAnalytics(dataElementCodes, { dataServices }, query, {
    aggregationType: aggregator.aggregationTypes.FINAL_EACH_MONTH,
  });

  // Set up data structure to be aggregated (potentially acrosss multiple facilities)
  const totalsPerDataElement = {};
  const incrementTotals = ({ dataElement: dataElementCode, value }) => {
    totalsPerDataElement[dataElementCode] = (totalsPerDataElement[dataElementCode] || 0) + value;
  };

  if (entity.isFacility()) {
    // Single facility, don't worry if it is operational or not
    results.forEach(incrementTotals);
  } else {
    // Aggregate the achieved and target per month, across all operational facilities
    const operationalFacilities = await getFacilityStatuses(
      aggregator,
      query.organisationUnitCode,
      query.period,
    );
    aggregateOperationalFacilityValues(operationalFacilities, results, incrementTotals);
  }

  // Calculate the achieved and remaining of target for each group
  const groupValues = [];
  groups.forEach(({ achievedDataElementCode, targetDataElementCode, name }) => {
    const achievedForGroup = totalsPerDataElement[achievedDataElementCode] || 0;
    const remainingTargetForGroup = Math.max(
      (totalsPerDataElement[targetDataElementCode] || 0) - achievedForGroup,
      0,
    );
    groupValues.push({
      name,
      achieved: achievedForGroup,
      remaining: remainingTargetForGroup,
    });
  });

  return { data: groupValues };
};
