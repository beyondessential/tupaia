import winston from 'winston';
import { AGGREGATION_TYPES } from '@tupaia/dhis-api';

/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

export const preaggregateDataElement = async (dhisApi, aggregatedDataElementCode, formula) => {
  winston.log('Preaggregating', { aggregatedDataElementCode, transactional: false });
  const query = {
    organisationUnitCode: 'World',
    dataElementCodes: Object.keys(formula),
    outputIdScheme: 'code',
  };
  const { results } = await dhisApi.getAnalytics(query, {}, AGGREGATION_TYPES.FINAL_EACH_MONTH);
  const calculatedValues = {};
  results.forEach(
    ({ dataElement: dataElementCode, value, period, organisationUnit: organisationUnitCode }) => {
      const formulaSpecForDataElement =
        typeof formula[dataElementCode] === 'string'
          ? { operator: formula[dataElementCode] }
          : formula[dataElementCode]; // Formula spec either a simple '+'/'-' or an object with more details

      if (!calculatedValues[organisationUnitCode]) {
        calculatedValues[organisationUnitCode] = {};
      }
      if (!calculatedValues[organisationUnitCode][period]) {
        calculatedValues[organisationUnitCode][period] = 0;
      }
      switch (formulaSpecForDataElement.operator) {
        default:
        case '+':
          calculatedValues[organisationUnitCode][period] += value;
          break;
        case '-':
          calculatedValues[organisationUnitCode][period] -= value;
          break;
      }
    },
  );
  const dataValues = [];
  Object.entries(calculatedValues).forEach(([organisationUnitCode, periods]) =>
    Object.entries(periods).forEach(([period, calculatedValue]) => {
      dataValues.push({
        orgUnit: organisationUnitCode,
        period,
        dataElement: aggregatedDataElementCode,
        value: calculatedValue,
      });
    }),
  );
  if (dataValues.length > 0) {
    await dhisApi.postDataValueSets(dataValues);
  }
};
