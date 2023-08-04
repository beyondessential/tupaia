import { PERIOD_TYPES } from '@tupaia/tsutils';
import { convertToPeriod } from '@tupaia/utils';

export const aggregateOperationalFacilityValues = (
  operationalFacilities,
  results,
  addValueToAggregation,
) => {
  // Find every match with each operational facility
  results.forEach(result => {
    const { organisationUnit: facilityId, period, ...restOfResult } = result;
    // Skip facility if it was not operational in this period.
    const wasFacilityOperationalInPeriod =
      operationalFacilities[facilityId] &&
      operationalFacilities[facilityId][convertToPeriod(period, PERIOD_TYPES.MONTH)];
    if (!wasFacilityOperationalInPeriod) {
      return;
    }
    // Call aggregation if found an operational facility
    addValueToAggregation({
      facilityId,
      period,
      countryCode: operationalFacilities[facilityId].countryCode,
      ...restOfResult,
    });
  });
};
