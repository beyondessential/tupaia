import { AGGREGATION_TYPES } from '@tupaia/dhis-api';
import { getDefaultPeriod, EARLIEST_DATA_DATE, getDhisApiInstance } from '/dhis';

// Request to calculate number of operational facilities with new query
const getFacilitiesData = async (
  dhisApi,
  parentCode,
  period,
  shouldOnlyReturnCurrentStatus,
  useCodeAsKey,
) => {
  const aggregationType = shouldOnlyReturnCurrentStatus
    ? AGGREGATION_TYPES.MOST_RECENT
    : AGGREGATION_TYPES.FINAL_EACH_MONTH_FILL_EMPTY_MONTHS;
  const { results } = await dhisApi.getAnalytics(
    {
      dataElementCodes: ['BCD1'],
      period,
      organisationUnitCode: parentCode,
      inputIdScheme: 'code',
      outputIdScheme: useCodeAsKey ? 'code' : 'uid',
    },
    {},
    aggregationType,
  );
  return results;
};

export const getFacilityStatuses = async (
  parentCode,
  period = getDefaultPeriod(),
  shouldOnlyReturnCurrentStatus = false,
  useCodeAsKey = false,
) => {
  const dhisApi = getDhisApiInstance(); // Always use the regional DHIS2 server for facility status

  // Have to add on earlier years to make sure that the 'LAST' aggregation type gets information
  // from them and carries them into the defined period as the most recent values, otherwise it
  // is lazy and just assumes there is no most recent value
  let previousYears = '';
  const currentYear = new Date().getFullYear();
  for (let year = EARLIEST_DATA_DATE.year(); year <= currentYear; year++) {
    previousYears = `${previousYears}${year};`;
  }
  const periodPlusEveryYear = `${previousYears}${period}`;
  const facilitiesData = await getFacilitiesData(
    dhisApi,
    parentCode,
    periodPlusEveryYear,
    shouldOnlyReturnCurrentStatus,
    useCodeAsKey,
  );

  // Put together an object with the facility ids as the keys, and an array of periods they were in operation
  const operationalFacilityStatuses = {};
  facilitiesData.forEach(({ organisationUnit: facilityKey, period: periodOfOperation, value }) => {
    if (periodIsAnnual(periodOfOperation)) {
      // Don't use annual values, see above for why we include in query
      return;
    }
    if (shouldOnlyReturnCurrentStatus) {
      operationalFacilityStatuses[facilityKey] = isFacilityOperational(value);
    } else {
      if (!operationalFacilityStatuses[facilityKey]) {
        operationalFacilityStatuses[facilityKey] = {};
      }
      operationalFacilityStatuses[facilityKey][periodOfOperation] = isFacilityOperational(value);
    }
  });
  return operationalFacilityStatuses;
};

export const getFacilityStatusCounts = async (parentCode, period) => {
  const facilityStatuses = await getFacilityStatuses(parentCode, period, true);
  let numberOperational = 0;
  Object.values(facilityStatuses).forEach(isOperational => isOperational && numberOperational++);
  const total = Object.keys(facilityStatuses).length;
  return {
    numberOperational,
    total,
  };
};

// Operational facilities have value 0 (Fully Operational) or 1 (Operational But Closed This Week);
const isFacilityOperational = value => value < 2;

// Annual periods only have four characters, e.g. 2018
const periodIsAnnual = period => period.length === 4;
