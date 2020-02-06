/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import {
  AGGREGATION_TYPES,
  PERIOD_TYPES,
  convertToPeriod,
  periodToTimestamp,
} from '@tupaia/dhis-api';
import {
  aggregateOperationalFacilityValues,
  getFacilityStatuses,
  getMatchedNumeratorsAndDenominators,
  timestampToPeriodName,
  limitRange,
} from '/apiV1/utils';

const {
  FINAL_EACH_MONTH,
  FINAL_EACH_MONTH_FILL_EMPTY_MONTHS,
  FINAL_EACH_YEAR,
  FINAL_EACH_YEAR_FILL_EMPTY_YEARS,
} = AGGREGATION_TYPES;

const { MONTH, YEAR } = PERIOD_TYPES;

/**
 * Returns the aggregation types to be used for the numerator and denominator
 * in a percentage per period aggregation.
 *
 * 'Fill empty' aggregations fill values based on the last available data,
 *  e.g. if the last population data for a district is for year 2017,
 *  we use it for calculating percentages in subsequent years
 *
 * @param {string} periodType
 * @param {boolean} fillEmptyDenominatorValues
 * @returns {Object} An object with { numerator: {string}, denominator: {string} } shape
 */
const getAggregationTypes = (periodType, fillEmptyDenominatorValues = false) => {
  switch (periodType) {
    case MONTH:
      return {
        numerator: FINAL_EACH_MONTH,
        denominator: fillEmptyDenominatorValues
          ? FINAL_EACH_MONTH_FILL_EMPTY_MONTHS
          : FINAL_EACH_MONTH,
      };
    case YEAR:
      return {
        numerator: FINAL_EACH_YEAR,
        denominator: fillEmptyDenominatorValues
          ? FINAL_EACH_YEAR_FILL_EMPTY_YEARS
          : FINAL_EACH_YEAR,
      };
    default:
      throw new Error('Unsupported aggregation type');
  }
};

const percentagesPerPeriod = async ({ dataBuilderConfig, query, entity }, dhisApi, periodType) => {
  // Function to fetch analytics for a metric
  const { fillEmptyDenominatorValues } = dataBuilderConfig;
  const aggregationTypes = getAggregationTypes(periodType, fillEmptyDenominatorValues);

  const fetchAnalytics = async metric => {
    const { results: denominatorResults } = await dhisApi.getAnalytics(
      { dataElementGroupCode: metric.denominatorDataElementGroupCode },
      fillEmptyDenominatorValues ? { ...query, period: undefined } : query,
      aggregationTypes.denominator,
    );

    const { results: numeratorResults } = await dhisApi.getAnalytics(
      { dataElementGroupCode: metric.numeratorDataElementGroupCode },
      query,
      aggregationTypes.numerator,
    );
    return { denominatorResults, numeratorResults };
  };

  // If metrics is empty just use a single metric with the key 'value'
  const metrics = dataBuilderConfig.series || [];
  if (metrics.length === 0) {
    metrics.push({
      key: 'value',
      numeratorDataElementGroupCode: dataBuilderConfig.numeratorDataElementGroupCode,
      denominatorDataElementGroupCode: dataBuilderConfig.denominatorDataElementGroupCode,
    });
  }

  // Function to increment a percentage by a  period, potentially across multiple metrics
  const metricDataByPeriod = {};
  const facilityInfo = {};
  const incrementMetricByPeriod = ({ period, numerator, denominator, facilityId }, metricKey) => {
    const timestamp = periodToTimestamp(convertToPeriod(period, periodType));
    if (!metricDataByPeriod[timestamp]) {
      // Set up object to hold data for the period, e.g. { 1547680904662: {} }
      metricDataByPeriod[timestamp] = {};
    }
    if (!metricDataByPeriod[timestamp][metricKey]) {
      // Set up object to hold data for metric, e.g. { 1547680904662: { value: { numerator: 0, denominator: 0 } } }
      // ('value' is the default metric if specific metrics are not specified)
      metricDataByPeriod[timestamp][metricKey] = { numerator: 0, denominator: 0 };
    }
    // Store the running total of numerator or denominator so we can calculate percentage later
    metricDataByPeriod[timestamp][metricKey].numerator += numerator;
    metricDataByPeriod[timestamp][metricKey].denominator += denominator;
    if (!facilityInfo[timestampToPeriodName(timestamp)])
      facilityInfo[timestampToPeriodName(timestamp)] = {};
    facilityInfo[timestampToPeriodName(timestamp)][facilityId] = { numerator, denominator };
  };

  // Get facility statuses if we're looking at more than one facility
  const operationalFacilities = entity.isFacility()
    ? null
    : await getFacilityStatuses(query.organisationUnitCode, query.period);

  // Fetch analytics for each metric in series
  for (let i = 0; i < metrics.length; i++) {
    const metric = metrics[i];
    const { numeratorResults, denominatorResults } = await fetchAnalytics(metric);

    const matchedData = getMatchedNumeratorsAndDenominators(
      numeratorResults,
      denominatorResults,
      periodType,
    );
    const incrementMetric = result => incrementMetricByPeriod(result, metric.key);

    if (entity.isFacility()) {
      // Single facility, don't worry if it is operational or not
      matchedData.forEach(incrementMetric);
    } else {
      // Aggregate the numerator per period, across all operational facilities
      aggregateOperationalFacilityValues(operationalFacilities, matchedData, incrementMetric);
    }
  }

  // Convert numerator and denominator to percentages for each metric, each period
  const { range } = dataBuilderConfig;
  const calculatePercentage = range
    ? (numerator, denominator) => limitRange(numerator / denominator, range) // Limit the range if required (e.g 0.0 - 1.0)
    : (numerator, denominator) => numerator / denominator;
  const percentagesByPeriod = {};
  Object.entries(metricDataByPeriod).forEach(([periodTimestamp, metricData]) => {
    percentagesByPeriod[periodTimestamp] = {};
    Object.entries(metricData).forEach(([metricKey, { numerator, denominator }]) => {
      if (denominator && (numerator || numerator === 0)) {
        percentagesByPeriod[periodTimestamp][metricKey] = calculatePercentage(
          numerator,
          denominator,
        );
      }
    });
  });

  // Structure the response data
  return {
    data: Object.keys(percentagesByPeriod)
      .sort()
      .map(periodTimestamp => {
        const timestamp = parseInt(periodTimestamp, 10);
        const dataForPeriod = {
          name: timestampToPeriodName(timestamp, periodType),
          timestamp,
          ...percentagesByPeriod[periodTimestamp],
        };
        return dataForPeriod;
      })
      .filter(x => x),
  };
};

export const monthlyPercentages = async (queryConfig, dhisApi) =>
  percentagesPerPeriod(queryConfig, dhisApi, MONTH);

export const annualPercentages = async (queryConfig, dhisApi) =>
  percentagesPerPeriod(queryConfig, dhisApi, YEAR);
