import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { checkValueSatisfiesCondition } from '@tupaia/utils';
import { groupAnalyticsByOrgUnit } from './helpers';

/**
 * Example use case: If yes to SchCVD012 but no to SchCVD012a display 'Yes', if yes to SchCVD012 and yes to SchCVD012a display 'Yes, smart TV'
 * Example orgUnitConditions config:
 * orgUnitConditions: {
    Yes: {
      SchCVD012: {
        value: 'Yes',
        operator: '=',
      },
      SchCVD012a: {
        value: 'No',
        operator: '=',
      },
    },
    'Yes, smart TV': {
      SchCVD012: {
        value: 'Yes',
        operator: '=',
      },
      SchCVD012a: {
        value: 'Yes',
        operator: '=',
      },
    },
    No: {
      SchCVD012: {
        value: 'No',
        operator: '=',
      },
    },
 */
class CheckMultiConditionsByOrgUnit extends DataBuilder {
  async build() {
    const { dataElementCode: queryDataCode } = this.query;
    const { orgUnitConditions, dataElementCodes: configDataCodes } = this.config;

    const dataElementCodes = configDataCodes || [queryDataCode];
    const { period, results } = await this.fetchAnalytics(dataElementCodes);

    const measureData = [];
    const analyticsByOrgUnit = groupAnalyticsByOrgUnit(results);

    Object.entries(analyticsByOrgUnit).forEach(([organisationUnitCode, analytics]) => {
      Object.entries(orgUnitConditions).forEach(([displayValue, conditions]) => {
        let conditionsSatisfied = true;

        //Check if conditions are satisfied to add the analytic to measure data
        for (let i = 0; i < Object.entries(conditions).length; i++) {
          const [dataElement, condition] = Object.entries(conditions)[i];
          const analytic = analytics.find(a => a.dataElement === dataElement);
          conditionsSatisfied = checkValueSatisfiesCondition(analytic.value, condition);

          if (!conditionsSatisfied) {
            break;
          }
        }

        if (conditionsSatisfied) {
          measureData.push({ organisationUnitCode, value: displayValue });
        }
      });
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
) => {
  const builder = new CheckMultiConditionsByOrgUnit(
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
    undefined,
    measureBuilderConfig.aggregationType,
  );

  return builder.build();
};
