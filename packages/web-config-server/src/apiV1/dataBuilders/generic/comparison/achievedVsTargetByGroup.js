import { AGGREGATION_TYPES } from '@tupaia/dhis-api';
import { aggregateOperationalFacilityValues, getFacilityStatuses } from '/apiV1/utils';

export const achievedVsTargetByGroup = async ({ dataBuilderConfig, query, entity }, dhisApi) => {
  const { groups } = dataBuilderConfig;
  const dataElementCodes = [];
  groups.forEach(({ achievedDataElementCode, targetDataElementCode }) =>
    dataElementCodes.push(achievedDataElementCode, targetDataElementCode),
  );

  const { results, metadata } = await dhisApi.getAnalytics(
    { dataElementCodes },
    query,
    AGGREGATION_TYPES.FINAL_EACH_MONTH,
  );
  const { dataElementIdToCode } = metadata;

  // Set up data structure to be aggregated (potentially acrosss multiple facilities)
  const totalsPerDataElement = {};
  const incrementTotals = ({ dataElement: dataElementId, value }) => {
    const dataElementCode = dataElementIdToCode[dataElementId];
    totalsPerDataElement[dataElementCode] = (totalsPerDataElement[dataElementCode] || 0) + value;
  };

  if (entity.isFacility()) {
    // Single facility, don't worry if it is operational or not
    results.forEach(incrementTotals);
  } else {
    // Aggregate the achieved and target per month, across all operational facilities
    const operationalFacilities = await getFacilityStatuses(
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
