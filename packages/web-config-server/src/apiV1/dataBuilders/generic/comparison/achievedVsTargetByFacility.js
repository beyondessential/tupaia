import keyBy from 'lodash.keyby';
import { AGGREGATION_TYPES } from '@tupaia/dhis-api';
import { aggregateOperationalFacilityValues, getFacilityStatuses } from '/apiV1/utils';
import { ENTITY_TYPES } from '/models/Entity';

export const achievedVsTargetByFacility = async (
  { dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const {
    achievedDataElementGroupCode,
    targetDataElementCode,
    targetDataElementGroupCode,
  } = dataBuilderConfig;

  const { results: targetData } = await dhisApi.getAnalytics(
    // Will use data element code if present, otherwise data element group code
    {
      dataElementCodes: targetDataElementCode && [targetDataElementCode],
      dataElementGroupCode: targetDataElementGroupCode,
      outputIdScheme: 'code',
    },
    query,
  );

  const { results: achievedData } = await dhisApi.getAnalytics(
    { dataElementGroupCode: achievedDataElementGroupCode, outputIdScheme: 'code' },
    query,
    AGGREGATION_TYPES.FINAL_EACH_MONTH,
  );

  const facilities = await entity.getDescendantsOfType(ENTITY_TYPES.FACILITY);
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
      query.organisationUnitCode,
      query.period,
      false,
      true,
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
