/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 **/

import winston from 'winston';

export const preaggregateDataElement = async (
  aggregator,
  dhisApi,
  aggregatedDataElementCode,
  formula,
) => {
  winston.log('Preaggregating', { aggregatedDataElementCode, transactional: false });
  const query = {
    organisationUnitCode: 'World',
    dataElementCodes: Object.keys(formula),
    outputIdScheme: 'code',
  };
  const { results } = await dhisApi.getAnalytics(
    query,
    {},
    aggregator.aggregationTypes.FINAL_EACH_MONTH,
  );

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
