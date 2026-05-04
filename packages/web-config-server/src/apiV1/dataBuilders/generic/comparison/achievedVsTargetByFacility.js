import { keyBy } from 'es-toolkit/compat';
import { aggregateOperationalFacilityValues, getFacilityStatuses } from '/apiV1/utils';

export const achievedVsTargetByFacility = async (
  { models, dataBuilderConfig, query, entity, fetchHierarchyId },
  aggregator,
) => {
  const { achievedDataElementCodes, targetDataElementCodes, dataServices } = dataBuilderConfig;

  const { results: targetData } = await aggregator.fetchAnalytics(
    targetDataElementCodes,
    { dataServices },
    query,
  );

  const { results: achievedData } = await aggregator.fetchAnalytics(
    achievedDataElementCodes,
    { dataServices },
    query,
    { aggregationType: aggregator.aggregationTypes.FINAL_EACH_MONTH },
  );

  const hierarchyId = await fetchHierarchyId();
  const facilities = await entity.getDescendantsOfType(hierarchyId, models.entity.types.FACILITY);
  const facilitiesByCode = keyBy(facilities, 'code');

  // Set up achieved to be aggregated (potentially acrosss multiple facilities)
  const achievedByFacility = {};
  const incrementAchievedByFacility = ({ facilityId, value }) => {
    const facilityName = facilitiesByCode[facilityId].name;
    achievedByFacility[facilityName] = (achievedByFacility[facilityName] || 0) + value;
  };

  // Set up target to be aggregated (potentially acrosss multiple facilities)
  const targetByFacility = {};
  const incrementTargetByFacility = ({ facilityId, value }) => {
    const facilityName = facilitiesByCode[facilityId].name;
    targetByFacility[facilityName] = (targetByFacility[facilityName] || 0) + value;
  };

  if (entity.isFacility()) {
    // Single facility, don't worry if it is operational or not
    achievedData.forEach(incrementAchievedByFacility);
    targetData.forEach(incrementTargetByFacility);
  } else {
    // Aggregate the achieved and target per month, across all operational facilities
    const operationalFacilities = await getFacilityStatuses(
      aggregator,
      query.organisationUnitCode,
      query.period,
    );
    aggregateOperationalFacilityValues(
      operationalFacilities,
      achievedData,
      incrementAchievedByFacility,
    );
    aggregateOperationalFacilityValues(
      operationalFacilities,
      targetData,
      incrementTargetByFacility,
    );
  }

  // Calculate the achieved and remaining of target for each facility
  const facilityValues = [];
  Object.entries(targetByFacility).forEach(([facilityName, value]) => {
    const achievedForFacility = achievedByFacility[facilityName] || 0;
    const remainingTargetForFacility = Math.max(value - achievedForFacility, 0);
    facilityValues.push({
      name: facilityName,
      achieved: achievedForFacility,
      remaining: remainingTargetForFacility,
    });
  });

  return { data: facilityValues };
};
