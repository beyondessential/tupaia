import {
  AGGREGATION_TYPES,
  convertToPeriod,
  periodToTimestamp,
  PERIOD_TYPES,
} from '@tupaia/dhis-api';
import { aggregateOperationalFacilityValues, getFacilityStatuses } from '/apiV1/utils';

const periodToMonthTimestamp = period =>
  periodToTimestamp(convertToPeriod(period, PERIOD_TYPES.MONTH));

export const averageMonthlyValuesOverCount = async (
  { dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const { results, period } = await dhisApi.getAnalytics(
    dataBuilderConfig,
    query,
    AGGREGATION_TYPES.FINAL_EACH_MONTH,
  );

  const returnJson = {};
  // build json from dhis response
  returnJson.data = entity.isFacility()
    ? await buildData(results)
    : await buildAggregatedData(results, query.organisationUnitCode, period);
  return returnJson;
};
// parse analytic response, aggregate only operational facilities
// and convert to config api response
const buildAggregatedData = async (results, organisationUnitCode, period) => {
  // Map all periods (YYYYMM) with summed values of only operational facilities
  const totalsByPeriod = {};
  const incrementTotalsByPeriod = ({ period: thisPeriod, value }) => {
    if (!totalsByPeriod[thisPeriod]) totalsByPeriod[thisPeriod] = { sum: 0, count: 0 };
    totalsByPeriod[thisPeriod].sum += value;
    totalsByPeriod[thisPeriod].count++;
  };

  // Will count only operational facilities
  const operationalFacilities = await getFacilityStatuses(organisationUnitCode, period);
  aggregateOperationalFacilityValues(operationalFacilities, results, incrementTotalsByPeriod);

  // Return each averaged value of all operational facilities for each month
  return Object.entries(totalsByPeriod).map(([key, value]) => ({
    timestamp: periodToMonthTimestamp(key),
    value: value.sum / value.count,
  }));
};

// parse analytic response and convert to config api response
const buildData = results => {
  const returnData = [];
  // translate parsed analytic to [{ x: , y: }]
  results.forEach(row => {
    const returnedRow = {
      timestamp: periodToMonthTimestamp(row.period),
      value: row.value,
    };
    returnData.push(returnedRow);
  });

  return returnData;
};
