import { fetchComposedData } from '/apiV1/dataBuilders/helpers';
import { divideValues } from '/apiV1/dataBuilders/helpers';

export const composePercentagesPerPeriodByOrgUnit = async (config, aggregator, dhisApi) => {
  const responses = await fetchComposedData(config, aggregator, dhisApi);
  const { value: percentages } = config.dataBuilderConfig.percentages;
  const data = [];
  responses[percentages.denominator].data.forEach(denominatorResponse => {
    const { name, timestamp, ...orgUnits } = denominatorResponse;
    const numeratorReponse = responses[percentages.numerator].data.find(
      numerator => numerator.name === name && numerator.timestamp === timestamp,
    );
    const dataValue = { name, timestamp };
    Object.entries(orgUnits).forEach(([orgUnitCode, denominatorValue]) => {
      const numeratorValue = numeratorReponse ? numeratorReponse[orgUnitCode] || 0 : 0;
      dataValue[orgUnitCode] = divideValues(numeratorValue, denominatorValue);
    });
    data.push(dataValue);
  });

  return { data };
};
