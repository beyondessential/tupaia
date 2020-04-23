import { limitRange, regexLabel } from '/apiV1/utils';
import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';

export const percentagesByNominatedPairs = async ({ dataBuilderConfig, query }, aggregator) => {
  const {
    pairs,
    includeAggregateLine,
    range,
    numeratorLabelRegex,
    aggregationTypes,
    dataServices,
  } = dataBuilderConfig;

  // Function to fetch analytics for a metric
  const fetchAnalytics = async metric => {
    const {
      results: denominatorResults,
      metadata: denominatorMetadata,
    } = await aggregator.fetchAnalytics(
      metric.denominatorDataElementCodes,
      { dataServices },
      query,
      aggregationTypes.denominator,
    );

    const {
      results: numeratorResults,
      metadata: numeratorMetadata,
    } = await aggregator.fetchAnalytics(
      metric.numeratorDataElementCodes,
      { dataServices },
      query,
      aggregationTypes.numerator,
    );
    return {
      denominatorResults,
      numeratorResults,
      numeratorMetadata,
      denominatorMetadata,
    };
  };

  const numeratorsByDataElement = {};
  const denominatorsByDataElement = {};
  const metric = {
    key: 'value',
    numeratorDataElementCodes: Object.keys(pairs),
    denominatorDataElementCodes: Object.values(pairs),
  };
  const { numeratorResults, denominatorResults, numeratorMetadata } = await fetchAnalytics(metric);

  const resultKeysWithDenominator = {};
  denominatorResults.forEach(({ organisationUnit }) => {
    resultKeysWithDenominator[organisationUnit] = true;
  });
  // Removes numerator values that don't exist in the denominator
  const cleanedNumeratorResults = numeratorResults.filter(
    ({ organisationUnit }) => resultKeysWithDenominator[organisationUnit],
  );

  // Function to increment a numerator/denominator collection by month
  // (potentially across multiple metrics)
  const incrementForDataElement = (obj, dataElement, value) => {
    if (!obj[dataElement]) {
      obj[dataElement] = 0;
    }
    obj[dataElement] = (obj[dataElement] || 0) + value;
  };

  // Set up numerator to be aggregated
  const incrementNumeratorByDataElement = ({ value, dataElement }) => {
    incrementForDataElement(numeratorsByDataElement, dataElement, value);
  };

  // Set up denominator to be aggregated
  const incrementDenominatorByDataElement = ({ value, dataElement }) => {
    incrementForDataElement(denominatorsByDataElement, dataElement, value);
  };

  // Single facility, don't worry if it is operational or not
  cleanedNumeratorResults.forEach(incrementNumeratorByDataElement);
  denominatorResults.forEach(incrementDenominatorByDataElement);

  // Calculate the percentages (represented as 0.0 - 1.0) based on the numerator
  // and denominator for each month
  const percentageData = Object.keys(numeratorMetadata.dataElementCodeToName).map(
    numeratorDataElement => {
      const numerator = numeratorsByDataElement[numeratorDataElement];
      const name = regexLabel(
        numeratorMetadata.dataElementCodeToName[numeratorDataElement],
        numeratorLabelRegex,
      );
      const result = {
        name,
      };
      const denominatorDataElement = pairs[numeratorDataElement];
      let denominator;
      if (numerator !== null && numerator !== undefined) {
        denominator = denominatorDataElement && denominatorsByDataElement[denominatorDataElement];
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
