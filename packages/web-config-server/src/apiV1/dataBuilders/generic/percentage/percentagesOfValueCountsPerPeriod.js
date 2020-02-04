/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DataPerPeriodBuilder } from 'apiV1/dataBuilders/DataPerPeriodBuilder';
import { PercentagesOfValueCountsBuilder } from '/apiV1/dataBuilders/generic/percentage/percentagesOfValueCounts';
import { groupAnalyticsByPeriod } from '/dhis';
import { divideValues } from '/apiV1/dataBuilders/helpers';
import { Facility } from '/models';

const filterFacility = async (analytics, conditions) => {
  const facility = await Facility.find({
    type: {
      comparator: conditions.comparator,
      comparisonValue: '1',
    },
    code: {
      comparator: 'IN',
      comparisonValue: analytics.map(a => a.organisationUnit),
    },
  });
  return analytics.filter(el => {
    return facility.map(a => a.code).includes(el.organisationUnit);
  });
};

const TRANSFORMATIONS = {
  ORG_UNIT: filterFacility,
};

class BaseBuilder extends PercentagesOfValueCountsBuilder {
  async buildData(analytics) {
    const percentage = {};
    let transformData = analytics;

    if (this.config.transformation) {
      transformData = await TRANSFORMATIONS[this.config.transformation.name](
        analytics,
        this.config.transformation,
      );
    }

    Object.entries(this.config.dataClasses).forEach(([name, dataClass]) => {
      const [numerator, denominator] = this.calculateFractionPartsForDataClass(
        dataClass,
        transformData,
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
  dhisApi,
) => {
  const builder = new PercentagesOfValueCountsPerPeriodBuilder(
    dhisApi,
    dataBuilderConfig,
    query,
    organisationUnitInfo,
  );

  return builder.build();
};
