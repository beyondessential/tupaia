/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable max-classes-per-file */

import keyBy from 'lodash.keyby';
import groupBy from 'lodash.groupby';

import { groupAnalyticsByPeriod } from '@tupaia/dhis-api';
import { PERIOD_TYPES, parsePeriodType } from '@tupaia/utils';
import { DataPerPeriodBuilder } from 'apiV1/dataBuilders/DataPerPeriodBuilder';
import { PercentagesOfValueCountsBuilder } from '/apiV1/dataBuilders/generic/percentage/percentagesOfValueCounts';
import { divideValues, mapAnalyticsToCountries } from '/apiV1/dataBuilders/helpers';
import { Facility, Entity } from '/models';

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

const { MONTH, QUARTER, YEAR } = PERIOD_TYPES;
const FILTERS = {
  filterFacility,
};

class BaseBuilder extends PercentagesOfValueCountsBuilder {
  getAggregationType() {
    switch (parsePeriodType(this.config.periodType)) {
      case MONTH:
        return {
          numerator: this.aggregator.aggregationTypes.FINAL_EACH_MONTH,
          denominator: this.config.fillEmptyDenominatorValues
            ? this.aggregator.aggregationTypes.FINAL_EACH_MONTH_FILL_EMPTY_MONTHS
            : this.aggregator.aggregationTypes.FINAL_EACH_MONTH,
        };
      case QUARTER:
        return {
          numerator: this.aggregator.aggregationTypes.FINAL_EACH_QUARTER,
          denominator: this.config.fillEmptyDenominatorValues
            ? this.aggregator.aggregationTypes.FINAL_EACH_QUARTER_FILL_EMPTY_QUARTERS
            : this.aggregator.aggregationTypes.FINAL_EACH_QUARTER,
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

  async buildData(analytics) {
    let filteredData = analytics;
    const percentage = {};

    if (this.config.customFilter) {
      filteredData = await FILTERS[this.config.customFilter.name](
        this.config.customFilter,
        analytics,
      );
    }

    const dataClassesWithAnalytics = await this.getDataClassesWithAnalytics(filteredData);
    Object.entries(dataClassesWithAnalytics).forEach(([key, dataClass]) => {
      const numerator = this.calculateFractionPart(dataClass.numerator, dataClass.analytics);
      const denominator = this.calculateFractionPart(dataClass.denominator, dataClass.analytics);
      percentage[key] = divideValues(numerator, denominator);
      percentage[`${key}_metadata`] = { numerator, denominator };
    });

    return [percentage];
  }

  getDataClassesWithAnalytics = async analytics => {
    if (this.config.isProjectReport) {
      const dataWithCountries = await mapAnalyticsToCountries(analytics);
      const dataByCountry = groupBy(dataWithCountries, result => result.organisationUnit);
      // Only one data class is supported for country data classes
      const baseDataClass = Object.values(this.config.dataClasses)[0];
      const countryCodesToName = {};
      const countryCodesToNamePromises = Object.entries(dataByCountry).map(
        async ([countryCode]) => {
          const countryEntity = await Entity.findOne({ code: countryCode });
          const country = await countryEntity.getCountry();
          return { [countryCode]: country.name };
        },
        {},
      );
      (await Promise.all(countryCodesToNamePromises)).forEach(country =>
        Object.assign(countryCodesToName, country),
      );

      return Object.entries(dataByCountry).reduce(
        (result, [code, analyticsForCountry]) => ({
          ...result,
          [countryCodesToName[code]]: { ...baseDataClass, analytics: analyticsForCountry },
        }),
        {},
      );
    }

    const hasMultipleClasses = Object.keys(this.config.dataClasses).length > 1;
    return Object.entries(this.config.dataClasses).reduce((result, [name, dataClass]) => {
      const key = hasMultipleClasses ? name : 'value';
      return { ...result, [key]: { ...dataClass, analytics } };
    }, {});
  };
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
