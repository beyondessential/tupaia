/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import keyBy from 'lodash.keyby';
import flatten from 'lodash.flatten';

import { groupAnalyticsByPeriod } from '@tupaia/dhis-api';
import { PERIOD_TYPES, parsePeriodType } from '@tupaia/utils';
import { DataPerPeriodBuilder } from 'apiV1/dataBuilders/DataPerPeriodBuilder';
import { PercentagesOfValueCountsBuilder } from '/apiV1/dataBuilders/generic/percentage/percentagesOfValueCounts';
import { divideValues } from '/apiV1/dataBuilders/helpers';
import { Facility } from '/models';

const filterFacility = async (filterCriteria, analytics) => {
  const facilities = await Facility.find({
    type: {
      comparator: filterCriteria.comparator,
      comparisonValue: '1',
    },
    code: {
      comparator: 'IN',
      comparisonValue: analytics.map(a => a.organisationUnit),
    },
  });

  const facilitiesByCode = keyBy(facilities, 'code');
  return analytics.filter(({ organisationUnit: orgUnitCode }) => facilitiesByCode[orgUnitCode]);
};

const { MONTH, YEAR } = PERIOD_TYPES;
const FILTERS = {
  filterFacility,
};

class BaseBuilder extends PercentagesOfValueCountsBuilder {
  getDataElementCodes() {
    const codes = {
      numerator: [],
      denominator: [],
    };
    Object.values(this.config.dataClasses).forEach(({ numerator, denominator }) => {
      codes.numerator.push(flatten(numerator.dataValues));
      denominator.hasOwnProperty('dataValues') && codes.denominator.push(denominator.dataValues);
    });

    return codes;
  }

  getAggregationType() {
    switch (parsePeriodType(this.config.periodType)) {
      case MONTH:
        return {
          numerator: this.aggregator.aggregationTypes.FINAL_EACH_MONTH,
          denominator: this.config.fillEmptyDenominatorValues
            ? this.aggregator.aggregationTypes.FINAL_EACH_MONTH_FILL_EMPTY_MONTHS
            : this.aggregator.aggregationTypes.FINAL_EACH_MONTH,
        };
      case YEAR:
        return {
          numerator: this.aggregator.aggregationTypes.FINAL_EACH_YEAR,
          denominator: this.config.fillEmptyDenominatorValues
            ? this.aggregator.aggregationTypes.FINAL_EACH_YEAR_FILL_EMPTY_YEARS
            : this.aggregator.aggregationTypes.FINAL_EACH_YEAR,
        };
      default:
        throw new Error('Unsupported aggregation type');
    }
  }

  async fetchResults() {
    const { numerator: numeratorCodes, denominator: denominatorCodes } = this.getDataElementCodes();
    const {
      numerator: numeratorAggregationType,
      denominator: denominatorAggregationType,
    } = this.getAggregationType();

    const { results: numeratorResults } = await this.fetchAnalytics(
      numeratorCodes,
      {},
      numeratorAggregationType,
    );
    const { results: denominatorResults } = await this.fetchAnalytics(
      denominatorCodes,
      {},
      denominatorAggregationType,
    );

    return [...denominatorResults, ...numeratorResults];
  }

  async buildData(analytics) {
    let filteredData = analytics;
    const percentage = {};

    if (this.config.customFilter) {
      filteredData = await FILTERS[this.config.customFilter.name](
        this.config.customFilter,
        analytics,
      );
    }

    Object.entries(this.config.dataClasses).forEach(([name, dataClass]) => {
      const numerator = this.calculateFractionPart(dataClass.numerator, filteredData);
      const denominator = this.calculateFractionPart(dataClass.denominator, filteredData);
      const key = Object.keys(this.config.dataClasses).length > 1 ? name : 'value';
      percentage[key] = divideValues(numerator, denominator);
      percentage[`${key}_metadata`] = { numerator, denominator };
    });
    return [percentage];
  }
}

class PercentagesOfValueCountsPerPeriodBuilder extends DataPerPeriodBuilder {
  getBaseBuilderClass = () => BaseBuilder;

  groupResultsByPeriod(results) {
    return groupAnalyticsByPeriod(results, this.config.periodType);
  }

  async fetchResults() {
    return this.getBaseBuilder().fetchResults();
  }

  formatData(data) {
    return this.areDataAvailable(data) ? data : [];
  }
}

export const percentagesOfValueCountsPerPeriod = async (
  { dataBuilderConfig, query, organisationUnitInfo },
  aggregator,
  dhisApi,
) => {
  const builder = new PercentagesOfValueCountsPerPeriodBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    organisationUnitInfo,
  );

  return builder.build();
};
