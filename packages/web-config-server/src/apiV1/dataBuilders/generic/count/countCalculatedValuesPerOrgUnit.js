import groupBy from 'lodash.groupby';
import { checkValueSatisfiesCondition } from '@tupaia/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import {
  calculateOperationForAnalytics,
  getDataElementsFromCalculateOperationConfig,
} from '/apiV1/dataBuilders/helpers';

class CountCalculatedValuesPerOrgUnit extends DataBuilder {
  async build() {
    const { operation, dataClasses } = this.config;
    const dataElementCodes = getDataElementsFromCalculateOperationConfig(operation);
    const { results } = await this.fetchAnalytics(dataElementCodes);
    const analyticsByOrgUnit = groupBy(results, 'organisationUnit');
    const calculatedValues = Object.values(analyticsByOrgUnit).map(analytics =>
      calculateOperationForAnalytics(analytics, operation),
    );

    const data = Object.entries(dataClasses).map(([dataClass, condition]) => {
      const count = calculatedValues.filter(value => checkValueSatisfiesCondition(value, condition))
        .length;

      return {
        name: dataClass,
        value: count,
      };
    });

    return { data };
  }
}

export const countCalculatedValuesPerOrgUnit = async (
  { dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
  aggregationType,
) => {
  const builder = new CountCalculatedValuesPerOrgUnit(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregationType,
  );
  return builder.build();
};
