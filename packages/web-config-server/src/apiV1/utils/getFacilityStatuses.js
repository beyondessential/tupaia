import { convertPeriodStringToDateRange, convertDateRangeToPeriodString } from '@tupaia/utils';
import { getDefaultPeriod, EARLIEST_DATA_DATE } from '/utils';

// Request to calculate number of operational facilities with new query
const getFacilitiesData = async (aggregator, parentCode, period, shouldOnlyReturnCurrentStatus) => {
  const aggregationType = shouldOnlyReturnCurrentStatus
    ? aggregator.aggregationTypes.MOST_RECENT
    : aggregator.aggregationTypes.FINAL_EACH_MONTH_FILL_EMPTY_MONTHS;

  const { results } = await aggregator.fetchAnalytics(
    ['BCD1'],
    {
      period,
      organisationUnitCode: parentCode,
      entityAggregation: { dataSourceEntityType: 'facility' },
    },
    {},
    { aggregationType },
  );
  return results;
};

export const getFacilityStatuses = async (
  aggregator,
  parentCode,
  period,
  shouldOnlyReturnCurrentStatus = false,
) => {
  // Have to add on earlier years to make sure that the 'LAST' aggregation type gets information
  // from them and carries them into the defined period as the most recent values, otherwise it
  // is lazy and just assumes there is no most recent value
  const [, endDate] = convertPeriodStringToDateRange(period || getDefaultPeriod());
  const fullPeriod = convertDateRangeToPeriodString(EARLIEST_DATA_DATE, endDate);
  const facilitiesData = await getFacilitiesData(
    aggregator,
    parentCode,
    fullPeriod,
    shouldOnlyReturnCurrentStatus,
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

export const fetchOperationalFacilityCodes = async (aggregator, ancestorCode, period) => {
  const facilityStatuses = await getFacilityStatuses(aggregator, ancestorCode, period, true);
  return Object.entries(facilityStatuses)
    .filter(([, isOperational]) => isOperational)
    .map(([code]) => code);
};

export const getFacilityStatusCounts = async (aggregator, parentCode, period) => {
  const facilityStatuses = await getFacilityStatuses(aggregator, parentCode, period, true);
  let numberOperational = 0;
  Object.values(facilityStatuses).forEach(isOperational => isOperational && numberOperational++);
  const total = Object.keys(facilityStatuses).length;
  return {
    numberOperational,
    total,
  };
};

const OPERATIONAL_STATES = ['Fully Operational', 'Operational but closed this week'];
const isFacilityOperational = value => OPERATIONAL_STATES.includes(value);

// Annual periods only have four characters, e.g. 2018
const periodIsAnnual = period => period.length === 4;
