import winston from 'winston';

/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

export const preaggregateTransactionalDataElement = async (
  aggregator,
  dhisApi,
  aggregatedDataElementCode,
  baselineDataElementCode,
  changeDataElementCode,
) => {
  winston.log('Preaggregating', { aggregatedDataElementCode, transactional: true });
  const query = {
    organisationUnitCode: 'World',
    dataElementCodes: [baselineDataElementCode, changeDataElementCode],
    outputIdScheme: 'code',
  };
  const { results } = await dhisApi.getAnalytics(
    query,
    {},
    aggregator.aggregationTypes.FINAL_EACH_MONTH,
  );

  const baselineValues = {};
  const changeValues = {};
  results.forEach(
    ({ dataElement: dataElementCode, value, period, organisationUnit: organisationUnitCode }) => {
      if (dataElementCode === baselineDataElementCode) {
        if (!baselineValues[organisationUnitCode]) {
          baselineValues[organisationUnitCode] = [];
        }
        baselineValues[organisationUnitCode].push({
          period,
          value,
        });
      } else {
        if (!changeValues[organisationUnitCode]) {
          changeValues[organisationUnitCode] = [];
        }
        changeValues[organisationUnitCode].push({
          period,
          value,
        });
      }
    },
  );

  const runningTotals = {};
  const organisationUnits = Object.keys(baselineValues);
  organisationUnits.forEach(organisationUnitCode => {
    if (!runningTotals[organisationUnitCode]) {
      runningTotals[organisationUnitCode] = [];
    }
    const baselineValuesForOrganisationUnit = baselineValues[organisationUnitCode];
    const changeValuesForOrganisationUnit = changeValues[organisationUnitCode] || [];
    let changeValueIndex = 0;
    for (
      let baselineValueIndex = 0;
      baselineValueIndex < baselineValuesForOrganisationUnit.length;
      baselineValueIndex++
    ) {
      const baselineValue = baselineValuesForOrganisationUnit[baselineValueIndex];
      const nextBaselinePeriod =
        baselineValuesForOrganisationUnit.length > baselineValueIndex + 1 &&
        baselineValuesForOrganisationUnit[baselineValueIndex + 1].period;
      let calculatedValue = baselineValue.value;
      runningTotals[organisationUnitCode].push({
        orgUnit: organisationUnitCode,
        period: baselineValue.period,
        dataElement: aggregatedDataElementCode,
        value: calculatedValue,
      });
      for (; changeValueIndex < changeValuesForOrganisationUnit.length; changeValueIndex++) {
        const changeValue = changeValuesForOrganisationUnit[changeValueIndex];
        if (nextBaselinePeriod && changeValue.period >= nextBaselinePeriod) {
          break;
        }
        // Only use this change value if the period is greater than the baseline value we're currently
        // using, to avoid adding changes within the same month as a baseline was taken, or to doing a
        // calculation before a baseline was provided
        if (changeValue.period > baselineValue.period) {
          calculatedValue += changeValue.value;
          runningTotals[organisationUnitCode].push({
            orgUnit: organisationUnitCode,
            period: changeValue.period,
            dataElement: aggregatedDataElementCode,
            value: calculatedValue,
          });
        }
      }
    }
  });

  let dataValues = [];
  Object.values(runningTotals).forEach(valuesForOrganisationUnit => {
    dataValues = dataValues.concat(valuesForOrganisationUnit);
  });
  if (dataValues.length > 0) {
    await dhisApi.postDataValueSets(dataValues);
  }
};
