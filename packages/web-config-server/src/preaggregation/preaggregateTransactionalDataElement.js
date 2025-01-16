import winston from 'winston';

const fetchMonthlyValuesByEntityCode = async (aggregator, code, analyticsQuery) => {
  const { results } = await aggregator.fetchAnalytics(code, analyticsQuery, {
    aggregationType: aggregator.aggregationTypes.FINAL_EACH_MONTH,
  });

  const valuesByEntityCode = {};
  results.forEach(({ value, period, organisationUnit: entityCode }) => {
    if (!valuesByEntityCode[entityCode]) {
      valuesByEntityCode[entityCode] = [];
    }
    valuesByEntityCode[entityCode].push({
      period,
      value,
    });
  });
  return valuesByEntityCode;
};

export const preaggregateTransactionalDataElement = async (
  aggregator,
  aggregatedDataElementCode,
  baselineDataElementCode,
  changeDataElementCode,
  analyticsQuery,
) => {
  winston.info('Transactional preaggregation', {
    aggregatedDataElementCode,
    baselineDataElementCode,
    changeDataElementCode,
  });

  const baselineValues = await fetchMonthlyValuesByEntityCode(
    aggregator,
    baselineDataElementCode,
    analyticsQuery,
  );

  const changeValues = await fetchMonthlyValuesByEntityCode(
    aggregator,
    changeDataElementCode,
    analyticsQuery,
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
        code: aggregatedDataElementCode,
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
            code: aggregatedDataElementCode,
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
    await aggregator.pushAggregateData(dataValues);
  }
};
