/* eslint-disable no-restricted-syntax */
import { fetchComposedData } from '/apiV1/dataBuilders/helpers';
import { divideValues } from '/apiV1/dataBuilders/helpers';
import { Entity } from '/models';

export const composePercentagesPerPeriodByOrgUnit = async (config, aggregator, dhisApi) => {
  const responses = await fetchComposedData(config, aggregator, dhisApi);
  const { value: percentages } = config.dataBuilderConfig.percentages;
  const data = [];
  const orgUnitCodeToName = {};
  for (const { name, timestamp, ...orgUnits } of responses[percentages.denominator].data) {
    const numeratorReponse = responses[percentages.numerator].data.find(
      numerator => numerator.name === name && numerator.timestamp === timestamp,
    );
    const dataValue = { name, timestamp };

    for (const [orgUnitCode, denominatorValue] of Object.entries(orgUnits)) {
      if (!orgUnitCodeToName[orgUnitCode]) {
        orgUnitCodeToName[orgUnitCode] = (await Entity.findOne({ code: orgUnitCode })).name;
      }
      const orgUnitName = orgUnitCodeToName[orgUnitCode];
      const numeratorValue = numeratorReponse ? numeratorReponse[orgUnitCode] || 0 : 0;
      dataValue[orgUnitName] = divideValues(numeratorValue, denominatorValue);
      dataValue[`${orgUnitName}_metadata`] = {
        numerator: numeratorValue,
        denominator: denominatorValue,
      };
    }
    data.push(dataValue);
  }

  return { data };
};
