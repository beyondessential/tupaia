/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import flatten from 'lodash.flatten';
import groupBy from 'lodash.groupby';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { divideValues, countAnalyticsThatSatisfyConditions } from '/apiV1/dataBuilders/helpers';

const ORG_UNIT_COUNT = '$orgUnitCount';
const COMPARISON_TYPES = {
  COUNT: '$count',
};
const OPERATION_TYPES = {
  GT: (leftOperand, rightOperand) => leftOperand > rightOperand,
  EQ: (leftOperand, rightOperand) => leftOperand == rightOperand,
  IN: (leftOperand, rightOperand) => rightOperand.includes(leftOperand),
};

export class PercentagesOfValueCountsBuilder extends DataBuilder {
  getDataElementCodes() {
    const dataElementCodes = Object.values(this.config.dataClasses).reduce(
      (codes, { numerator, denominator }) =>
        codes.concat(
          flatten(numerator.dataValues),
          denominator.hasOwnProperty('dataValues') && denominator.dataValues,
        ),
      [],
    );

    //Remove duplicated data element codes if there's any
    return [...new Set(dataElementCodes)];
  }

  async build() {
    const results = await this.fetchResults();
    const data = await this.buildData(results);

    return { data: this.areDataAvailable(data) ? data : [] };
  }

  async fetchResults() {
    const dataElementCodes = this.getDataElementCodes();
    const { results } = await this.fetchAnalytics(dataElementCodes);
    return results;
  }

  buildData(analytics) {
    const dataClasses = [];
    Object.entries(this.config.dataClasses).forEach(([name, dataClass]) => {
      const numerator = this.calculateFraction(dataClass.numerator, analytics);
      const denominator = this.calculateFraction(dataClass.denominator, analytics);

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

  calculateFraction = (fraction, analytics) => {
    if (fraction.compare || fraction.operation) {
      const calculator = this.buildCalculator(fraction);

      if (!calculator) {
        throw new Error('Could not create cacluation from percentagesOfValueCounts config');
      }

      const filteredAnalytics = analytics.filter(analytic =>
        flatten(fraction.dataValues).includes(analytic.dataElement),
      );

      return this.countAnalyticsWithCalculator(filteredAnalytics, calculator, fraction.groupBy);
    } else if (fraction === ORG_UNIT_COUNT) {
      return [...new Set(analytics.map(data => data.organisationUnit))].length;
    }

    return countAnalyticsThatSatisfyConditions(analytics, fraction);
  };

  countAnalyticsWithCalculator = (analytics, calculator, fractionGroupBy) => {
    let result = 0;

    //If there's groupBy set for analytics, try group the analytics before applying calculator.
    //If not, apply calculator to the raw analytics.
    if (fractionGroupBy) {
      const groupedAnalytics = groupBy(analytics, fractionGroupBy);

      Object.values(groupedAnalytics).forEach(analytic => {
        if (calculator(analytic)) result += 1;
      });
    } else {
      analytics.forEach(analytic => {
        if (calculator(analytic)) result += 1;
      });
    }

    return result;
  };

  buildCalculator(fraction) {
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

      return result => {
          return OPERATION_TYPES[fraction.operation](result.value, fraction.operand);
      }
      
    }
  }
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
