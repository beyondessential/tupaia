import { groupBy } from 'es-toolkit/compat';

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { checkValueSatisfiesCondition } from '@tupaia/utils';

const CONDITION_TYPE = {
  AND: 'every',
  OR: 'some',
};

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
      const [displayValue] =
        Object.entries(conditions).find(([_, conditionConfig]) => {
          const { conditionType = 'AND', condition: conditionValues } = conditionConfig;
          return Object.entries(conditionValues)[CONDITION_TYPE[conditionType]](
            ([dataElement, condition]) => {
              const analytic = analytics.find(a => a.dataElement === dataElement);
              return analytic ? checkValueSatisfiesCondition(analytic.value, condition) : false;
            },
          );
        }) || [];

      if (displayValue) {
        measureData.push({ organisationUnitCode, value: displayValue });
      }
    });

    return {
      data: measureData,
      period,
    };
  }
}

export const checkMultiConditionsByOrgUnit = async (
  models,
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig = {},
  entity,
) => {
  const builder = new CheckMultiConditionsByOrgUnit(
    models,
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
    entity,
    measureBuilderConfig.aggregationType,
  );

  return builder.build();
};
