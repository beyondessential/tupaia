import { convertToPeriod, periodToTimestamp } from '@tupaia/utils';

// Takes in a bunch of numerator and denominator results from DHIS2, and converts them into an array
// of objects containing a numerator and denominator for each organisation unit and month that has
// *both* a numerator and denominator in the original results
export const getMatchedNumeratorsAndDenominators = (
  numeratorResults,
  denominatorResults,
  periodType,
  includeAllDenominatorValues = false,
) => {
  // Store the numerator and denominator results accessible by a key made up of period and organisation unit
  const getResultKey = ({ period, organisationUnit }) => {
    const convertedPeriod = convertToPeriod(period, periodType);
    return `${periodToTimestamp(convertedPeriod)}_${organisationUnit}`;
  };

  const storeResultByKey = (resultsObject, result) => {
    const existingResult = resultsObject[getResultKey(result)];
    if (!existingResult) {
      resultsObject[getResultKey(result)] = { ...result }; // eslint-disable-line no-param-reassign
    } else {
      existingResult.value += result.value;
    }
  };

  const sumValueByPeriod = results => {
    const periodValues = {};
    Object.keys(results).forEach(resultKey => {
      const resultPeriod = results[resultKey].period;
      if (!periodValues[resultPeriod]) {
        periodValues[resultPeriod] = results[resultKey].value;
      } else {
        periodValues[resultPeriod] += results[resultKey].value;
      }
    });
    return periodValues;
  };

  const numeratorResultsByKey = {};
  numeratorResults.forEach(result => storeResultByKey(numeratorResultsByKey, result));
  const denominatorResultsByKey = {};
  denominatorResults.forEach(result => storeResultByKey(denominatorResultsByKey, result, true));

  if (includeAllDenominatorValues) {
    const denominatorPeriodValues = sumValueByPeriod(denominatorResultsByKey);
    Object.keys(denominatorResultsByKey).forEach(resultKey => {
      const resultPeriod = denominatorResultsByKey[resultKey].period;
      denominatorResultsByKey[resultKey].value = denominatorPeriodValues[resultPeriod] || 0;
    });
  }

  return Object.keys(numeratorResultsByKey)
    .filter(
      resultKey => denominatorResultsByKey[resultKey] && denominatorResultsByKey[resultKey].value,
    )
    .map(resultKey => {
      const numerator = numeratorResultsByKey[resultKey].value;
      const denominator = denominatorResultsByKey[resultKey].value;
      return {
        ...numeratorResultsByKey[resultKey],
        numerator,
        denominator,
      };
    });
};
