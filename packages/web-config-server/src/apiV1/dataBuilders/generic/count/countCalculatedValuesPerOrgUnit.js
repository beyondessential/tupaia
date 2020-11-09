import groupBy from 'lodash.groupby';
import { checkValueSatisfiesCondition } from '@tupaia/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import {
  calculateOperationForAnalytics,
  getDataElementsFromCalculateOperationConfig,
  divideValues,
} from '/apiV1/dataBuilders/helpers';

class CountCalculatedValuesPerOrgUnit extends DataBuilder {
  async build() {
    const { operation, dataClasses, convertToPercentage } = this.config;
    const dataElementCodes = getDataElementsFromCalculateOperationConfig(operation);
    const { results } = await this.fetchAnalytics(dataElementCodes);
    const analyticsByOrgUnit = groupBy(results, 'organisationUnit');
    const calculatedValues = Object.values(analyticsByOrgUnit).map(analytics =>
      calculateOperationForAnalytics(analytics, operation),
    );

    let sum = 0;
    const data = Object.entries(dataClasses).map(([dataClass, condition]) => {
      const count = calculatedValues.filter(value => checkValueSatisfiesCondition(value, condition))
        .length;

      sum += count;
      return {
        name: dataClass,
        value: count,
      };
    });

    if (convertToPercentage) {
      data.forEach(({ value }, index) => {
        data[index].value = divideValues(value, sum);
      });
    }

    return { data };
  }
}

export const countCalculatedValuesPerOrgUnit = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
  aggregationType,
) => {
  const builder = new CountCalculatedValuesPerOrgUnit(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregationType,
  );
  return builder.build();
};
