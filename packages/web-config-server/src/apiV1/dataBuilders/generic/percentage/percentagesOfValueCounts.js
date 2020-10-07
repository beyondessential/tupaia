/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import flatten from 'lodash.flatten';
import groupBy from 'lodash.groupby';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import {
  divideValues,
  countAnalyticsThatSatisfyConditions,
  countAnalyticsGroupsThatSatisfyConditions,
} from '/apiV1/dataBuilders/helpers';

const ORG_UNIT_COUNT = '$orgUnitCount';
const COMPARISON_TYPES = {
  COUNT: '$count',
};
const OPERATION_TYPES = {
  GT: (leftOperand, rightOperand) => leftOperand > rightOperand,
  // eslint-disable-next-line eqeqeq
  EQ: (leftOperand, rightOperand) => leftOperand == rightOperand,
  IN: (leftOperand, rightOperand) => rightOperand.includes(leftOperand),
};

const buildFilterAnalyticsFunction = fraction => {
  if (fraction.compare === COMPARISON_TYPES.COUNT) {
    if (fraction.dataValues.length !== 2) {
      throw new Error(
        'nested array passed to: percentagesOfValueCounts must have exactly 2 sub-arrays for comparison',
      );
    }

    const [values, valuesToCompare] = fraction.dataValues;
    return results => {
      const set1 = results.filter(r => values.includes(r.dataElement));
      const set2 = results.filter(r => valuesToCompare.includes(r.dataElement));

      const set1Count = countAnalyticsThatSatisfyConditions(set1, {
        dataValues: values,
        valueOfInterest: fraction.valueOfInterest,
      });

      const count2Count = countAnalyticsThatSatisfyConditions(set2, {
        dataValues: valuesToCompare,
        valueOfInterest: fraction.valueOfInterest,
      });

      return set1Count > 0 && set1Count === count2Count;
    };
  }

  if (fraction.operation) {
    if (fraction.groupBy) {
      return results => {
        return results.every(r => {
          return OPERATION_TYPES[fraction.operation](r.value, fraction.operand);
        });
      };
    }

    return result => OPERATION_TYPES[fraction.operation](result.value, fraction.operand);
  }

  throw new Error(`Could not parse calculation for: ${fraction}`);
};

export class PercentagesOfValueCountsBuilder extends DataBuilder {
  getDataElementCodes() {
    const getCodesFromConfig = config => {
      if (config.hasOwnProperty('dataValues')) {
        if (Array.isArray(config.dataValues)) {
          return flatten(config.dataValues);
        }
        return Object.keys(config.dataValues);
      }
      return [];
    };

    const codes = {
      numerator: [],
      denominator: [],
    };

    Object.values(this.config.dataClasses).forEach(({ numerator, denominator }) => {
      const numeratorCodesForClass = getCodesFromConfig(numerator);
      codes.numerator = codes.numerator.concat(numeratorCodesForClass);

      const denominatorCodesForClass = getCodesFromConfig(denominator);
      codes.denominator = codes.denominator.concat(denominatorCodesForClass);
    });

    // This ensures each bit of data is only fetched once.
    // Both sets of results will be available when building.
    const uniqueNumeratorCodes = new Set(codes.numerator);
    codes.denominator.forEach(elem => uniqueNumeratorCodes.delete(elem));

    return {
      numerator: [...uniqueNumeratorCodes],
      denominator: [...new Set(codes.denominator)],
    };
  }

  async build() {
    const results = await this.fetchResults();
    const data = await this.buildData(results);

    return { data: this.areDataAvailable(data) ? data : [] };
  }

  getAggregationType() {
    // Can be overwritten in child class
    return {};
  }

  async fetchResults() {
    const { numerator: numeratorCodes, denominator: denominatorCodes } = this.getDataElementCodes();
    const {
      numerator: numeratorAggregationType,
      denominator: denominatorAggregationType,
    } = this.getAggregationType();

    let numeratorResults = [];
    if (numeratorCodes.length > 0) {
      numeratorResults = (await this.fetchAnalytics(numeratorCodes, {}, numeratorAggregationType))
        .results;
    }

    if (denominatorCodes.length === 0) {
      return numeratorResults;
    }

    const { results: denominatorResults } = await this.fetchAnalytics(
      denominatorCodes,
      {},
      denominatorAggregationType,
    );

    const getResultMapKey = ({ organisationUnit, dataElement, value, period }) =>
      `${organisationUnit}|${dataElement}|${value}|${period}`;

    const allResults = numeratorResults;

    const numeratorResultsSet = new Set();
    numeratorResults.forEach(analytic => {
      numeratorResultsSet.add(getResultMapKey(analytic));
    });

    // Hack to make sure that there are no duplicated analytics returned to count twice.
    // Would like to have { denominatorResults, numeratorResults }, but can't because of how DataPerPeriodBuilder works
    denominatorResults.forEach(analytic => {
      if (!numeratorResultsSet.has(getResultMapKey(analytic))) {
        allResults.push(analytic);
      }
    });

    return allResults;
  }

  buildData(analytics) {
    const dataClasses = [];
    const getSortOrder = ({ sortOrder }) => sortOrder || 0;

    Object.entries(this.config.dataClasses)
      .sort(([key1, config1], [key2, config2]) => getSortOrder(config1) - getSortOrder(config2))
      .forEach(([name, dataClass]) => {
      const numerator = this.calculateFractionPart(dataClass.numerator, analytics);
      const denominator = this.calculateFractionPart(dataClass.denominator, analytics);

      const data = {
        value: divideValues(numerator, denominator),
        name,
        [`${name}_metadata`]: {
          numerator,
          denominator,
        },
      };

      dataClasses.push(data);
    });

    return dataClasses;
  }

  calculateFractionPart = (fraction, analytics) => {
    if (fraction.compare || fraction.operation) {
      const filterAnalyticsFunction = buildFilterAnalyticsFunction(fraction);
      const filteredAnalytics = analytics.filter(analytic =>
        flatten(fraction.dataValues).includes(analytic.dataElement),
      );

      return this.countAnalyticsUsingFilterFunction(
        filteredAnalytics,
        filterAnalyticsFunction,
        fraction.groupBy,
      );
    }
    if (fraction.groupBeforeCounting) {
      const groupedAnalytics = groupBy(analytics, fraction.groupBy);
      return countAnalyticsGroupsThatSatisfyConditions(groupedAnalytics, fraction);
    }
    if (fraction === ORG_UNIT_COUNT) {
      return [...new Set(analytics.map(data => data.organisationUnit))].length;
    }

    return countAnalyticsThatSatisfyConditions(analytics, fraction);
  };

  countAnalyticsUsingFilterFunction = (analytics, filterAnalyticsFunction, fractionGroupBy) => {
    let result = 0;

    // If there's groupBy set for analytics, try group the analytics before applying filterAnalyticsFunction.
    // If not, apply filterAnalyticsFunction to the raw analytics.
    if (fractionGroupBy) {
      const groupedAnalytics = groupBy(analytics, fractionGroupBy);

      Object.values(groupedAnalytics).forEach(analytic => {
        if (filterAnalyticsFunction(analytic)) result += 1;
      });
    } else {
      analytics.forEach(analytic => {
        if (filterAnalyticsFunction(analytic)) result += 1;
      });
    }

    return result;
  };
}

export const percentagesOfValueCounts = async (
  { dataBuilderConfig, query, organisationUnitInfo },
  aggregator,
  dhisApi,
) => {
  const builder = new PercentagesOfValueCountsBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    organisationUnitInfo,
  );

  return builder.build();
};
