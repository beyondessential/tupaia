import { AGGREGATION_TYPES } from '@tupaia/dhis-api';
import { limitRange, regexLabel } from '/apiV1/utils';
import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';

export const percentagesByNominatedPairs = async ({ dataBuilderConfig, query }, dhisApi) => {
  const {
    pairs,
    includeAggregateLine,
    range,
    numeratorLabelRegex,
    aggregationTypes,
  } = dataBuilderConfig;

  // Function to fetch analytics for a metric
  const fetchAnalytics = async metric => {
    const {
      results: denominatorResults,
      metadata: denominatorMetadata,
    } = await dhisApi.getAnalytics(
      { dataElementCodes: metric.denominatorDataElementCodes },
      query,
      AGGREGATION_TYPES[aggregationTypes.denominator],
    );

    const { results: numeratorResults, metadata: numeratorMetadata } = await dhisApi.getAnalytics(
      { dataElementCodes: metric.numeratorDataElementCodes },
      query,
      AGGREGATION_TYPES[aggregationTypes.numerator],
    );
    return {
      denominatorResults,
      numeratorResults,
      numeratorMetadata,
      denominatorMetadata,
    };
  };

  const numeratorsByDataElementId = {};
  const denominatorsByDataElementId = {};
  const metric = {
    key: 'value',
    numeratorDataElementCodes: Object.keys(pairs),
    denominatorDataElementCodes: Object.values(pairs),
  };
  const {
    numeratorResults,
    denominatorResults,
    numeratorMetadata,
    denominatorMetadata,
  } = await fetchAnalytics(metric);

  const resultKeysWithDenominator = {};
  denominatorResults.forEach(({ period, organisationUnit }) => {
    resultKeysWithDenominator[organisationUnit] = true;
  });
  // Removes numerator values that don't exist in the denominator
  const cleanedNumeratorResults = numeratorResults.filter(
    ({ organisationUnit }) => resultKeysWithDenominator[organisationUnit],
  );

  // Function to increment a numerator/denominator collection by month
  // (potentially across multiple metrics)
  const incrementForDataElementId = (obj, dataElementId, value) => {
    if (!obj[dataElementId]) {
      obj[dataElementId] = 0;
    }
    obj[dataElementId] = (obj[dataElementId] || 0) + value;
  };

  // Set up numerator to be aggregated
  const incrementNumeratorByDataElementId = ({ value, dataElement }) => {
    incrementForDataElementId(numeratorsByDataElementId, dataElement, value);
  };

  // Set up denominator to be aggregated
  const incrementDenominatorByDataElementId = ({ value, dataElement }) => {
    incrementForDataElementId(denominatorsByDataElementId, dataElement, value);
  };

  // Single facility, don't worry if it is operational or not
  cleanedNumeratorResults.forEach(incrementNumeratorByDataElementId);
  denominatorResults.forEach(incrementDenominatorByDataElementId);

  // Calculate the percentages (represented as 0.0 - 1.0) based on the numerator
  // and denominator for each month
  const percentageData = Object.keys(numeratorMetadata.dataElementIdToCode).map(
    numeratorDataElementId => {
      const numerator = numeratorsByDataElementId[numeratorDataElementId];
      const name = regexLabel(
        numeratorMetadata.dataElement[numeratorDataElementId],
        numeratorLabelRegex,
      );
      const result = {
        name,
      };
      const denominatorDataCode =
        pairs[numeratorMetadata.dataElementIdToCode[numeratorDataElementId]];
      const foundCodes = Object.entries(denominatorMetadata.dataElementIdToCode).find(
        ([elementId, code]) => denominatorDataCode === code,
      );
      let denominator;
      if (numerator !== null && numerator !== undefined && foundCodes && foundCodes.length) {
        const denominatorElementId = foundCodes[0];
        if (denominatorElementId && denominatorsByDataElementId[denominatorElementId]) {
          denominator = denominatorsByDataElementId[denominatorElementId];
        }
      }

      // get result for instances where numerator and denominator are missing
      if (
        numerator === null ||
        numerator === undefined ||
        denominator === undefined ||
        denominator === null
      ) {
        result.value = NO_DATA_AVAILABLE;
      } else {
        result.value = numerator / denominator;
        if (range) {
          result.value = limitRange(result.value, range);
        }
      }
      return result;
    },
  );
  const finalResult = {};
  // if all the values are N/A it's the same as empty
  if (percentageData.every(({ value }) => value === NO_DATA_AVAILABLE)) {
    finalResult.data = [];
    if (includeAggregateLine) {
      finalResult.aggregate = {};
    }
  } else {
    finalResult.data = percentageData;
    if (includeAggregateLine) {
      // deal with Javascript's horrendous rounding issues
      finalResult.aggregate = {};
      finalResult.aggregate.sum = percentageData
        .map(({ value }) => value)
        .reduce(
          (accumulator, value) => (Number(value) === value ? accumulator + value : accumulator),
          0,
        );
      finalResult.aggregate.count = percentageData.filter(
        ({ value }) => value !== NO_DATA_AVAILABLE,
      ).length;
    }
  }
  return finalResult;
};
