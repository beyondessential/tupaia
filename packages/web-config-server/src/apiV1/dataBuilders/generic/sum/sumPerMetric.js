import { AGGREGATION_TYPES } from '@tupaia/dhis-api';
import { sumResults } from '/apiV1/utils';

const sumPerMetric = async ({ dataBuilderConfig, query }, dhisApi, AGGREGATION_TYPE) => {
  const {
    labels = {},
    specialCases = {},
    dataElementsToSum,
    ...restOfDataBuilderConfig
  } = dataBuilderConfig;
  const { results, metadata } = await dhisApi.getAnalytics(
    restOfDataBuilderConfig,
    query,
    AGGREGATION_TYPE,
  );

  // Don't process results into valid data for front-end if there are none.
  if (results.length === 0) return { data: results };

  const returnData = {};
  const { dataElementIdToCode, dataElementCodeToName } = metadata;

  const calculateValueToAdd = (dataElementValue, dataElementCode) => {
    if (specialCases[dataElementCode] && specialCases[dataElementCode] === 'complement') {
      // Binary data element that requires its values (0 or 1) to be flipped
      return !dataElementValue;
    }
    return dataElementValue;
  };

  const getOrCreateReturnData = ({ value, ...resultObject }) => {
    const { name } = resultObject;
    if (!returnData[name]) {
      returnData[name] = {
        ...resultObject,
        value: 0,
      };
    }

    return returnData[name];
  };

  results
    .map(({ dataElement: dataElementId, ...result }) => {
      const dataElementCode = dataElementIdToCode[dataElementId];
      const name = labels[dataElementCode] || dataElementCodeToName[dataElementCode];
      return {
        ...result,
        dataElementCode,
        dataElementId,
        name,
      };
    })
    .forEach(resultObject => {
      const { value, dataElementCode } = resultObject;
      const returnDataObject = getOrCreateReturnData(resultObject);
      returnDataObject.value += calculateValueToAdd(value, dataElementCode);
    });

  const data = Object.values(returnData);
  data
    .sort((a, b) => {
      // preserve order of dataElementCodes in dataBuilderConfig
      const indexA = dataBuilderConfig.dataElementCodes.indexOf(a.dataElementCode);
      const indexB = dataBuilderConfig.dataElementCodes.indexOf(b.dataElementCode);
      return indexA - indexB;
    })
    .map(({ dataElementCode, ...r }) => ({
      ...r,
    }));

  // allow summing of certain elements to use as total, or sum all by defaut.
  if (dataBuilderConfig.includeTotal) {
    if (dataElementsToSum) {
      const resultsToSum = data.filter(result =>
        dataElementsToSum.includes(result.dataElementCode),
      );

      data.unshift(sumResults(resultsToSum));
    } else {
      data.unshift(sumResults(data));
    }
  }
  return { data };
};

export const sumLatestPerMetric = async (queryConfig, dhisApi) =>
  sumPerMetric(queryConfig, dhisApi, AGGREGATION_TYPES.SUM_MOST_RECENT_PER_FACILITY);

export const sumAllPerMetric = async (queryConfig, dhisApi) =>
  sumPerMetric(queryConfig, dhisApi, AGGREGATION_TYPES.SUM);
