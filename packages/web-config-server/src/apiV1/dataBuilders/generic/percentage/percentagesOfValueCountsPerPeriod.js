/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import keyBy from 'lodash.keyby';

import { groupAnalyticsByPeriod } from '@tupaia/dhis-api';
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

const FILTERS = {
  filterFacility,
};

class BaseBuilder extends PercentagesOfValueCountsBuilder {
  async buildData(analytics) {
    const percentage = {};
    let filteredData = analytics;

    if (this.config.filter) {
      filteredData = await FILTERS[this.config.filter.name](this.config.filter, analytics);
    }

    Object.entries(this.config.dataClasses).forEach(([name, dataClass]) => {
      const [numerator, denominator] = this.calculateFractionPartsForDataClass(
        dataClass,
        filteredData,
      );

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
