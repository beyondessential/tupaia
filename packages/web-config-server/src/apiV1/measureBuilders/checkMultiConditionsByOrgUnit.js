/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { checkValueSatisfiesCondition } from '@tupaia/utils';

/**
 * Example conditions config:
 * conditions: {
 *   Yes: {
 *     SchCVD012: { value: 'Yes', operator: '=' },
 *     SchCVD012a: { value: 'No', operator: '=' },
 *   }
 * }
 */
class CheckMultiConditionsByOrgUnit extends DataBuilder {
  async build() {
    const { dataElementCode: queryDataCode } = this.query;
    const { conditions, dataElementCodes: configDataCodes } = this.config;

    const dataElementCodes = configDataCodes || [queryDataCode];
    const { period, results } = await this.fetchAnalytics(dataElementCodes);

    const measureData = [];
    const analyticsByOrgUnit = groupBy(results, 'organisationUnit');

    Object.entries(analyticsByOrgUnit).forEach(([organisationUnitCode, analytics]) => {
      const orgUnitMeasureData = Object.entries(conditions)
        .filter(([displayValue, valueConditions]) => {
          return Object.entries(valueConditions).every(([dataElement, condition]) => {
            const analytic = analytics.find(a => a.dataElement === dataElement);
            return checkValueSatisfiesCondition(analytic.value, condition);
          });
        })
        .map(([displayValue]) => {
          return { organisationUnitCode, value: displayValue };
        });

      measureData.push(...orgUnitMeasureData);
    });

    return {
      data: measureData,
      period,
    };
  }
}

export const checkMultiConditionsByOrgUnit = async (
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig = {},
  entity,
) => {
  const builder = new CheckMultiConditionsByOrgUnit(
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
    entity,
    measureBuilderConfig.aggregationType,
  );

  return builder.build();
};
