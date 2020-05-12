import { getDataElementCodesInGroup, sumResults } from '/apiV1/utils';

import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';

const getDataElementCodes = async (dataBuilderConfig, dhisApi) => {
  const { dataElementCodes, dataElementGroupCode } = dataBuilderConfig;
  return dataElementGroupCode
    ? getDataElementCodesInGroup(dhisApi, dataElementGroupCode)
    : dataElementCodes;
};

const sumPerMetric = async ({ dataBuilderConfig, query }, aggregator, dhisApi, aggregationType) => {
  const {
    labels = {},
    specialCases = {},
    dataElementsToSum,
    filter = {},
    dataServices,
  } = dataBuilderConfig;

  const dataElementCodes = await getDataElementCodes(dataBuilderConfig, dhisApi);
  const { results, metadata, period } = await aggregator.fetchAnalytics(
    dataElementCodes,
    { dataServices },
    query,
    { aggregationType, filter },
  );

  // Don't process results into valid data for front-end if there are none.
  if (results.length === 0) return { data: results };

  const returnData = {};
  const { dataElementCodeToName } = metadata;

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

  const dataElementsWithData = [];
  results
    .map(({ dataElement: dataElementCode, ...result }) => {
      const name = labels[dataElementCode] || dataElementCodeToName[dataElementCode];
      return {
        ...result,
        dataElementCode,
        name,
      };
    })
    .forEach(resultObject => {
      const { value, dataElementCode } = resultObject;
      dataElementsWithData.push(dataElementCode);
      const returnDataObject = getOrCreateReturnData(resultObject);
      returnDataObject.value += calculateValueToAdd(value, dataElementCode);
    });

  const data = Object.values(returnData);
  if (dataBuilderConfig.dataElementCodes) {
    // Preserve order of dataElementCodes in dataBuilderConfig
    data.sort((a, b) => {
      const indexA = dataBuilderConfig.dataElementCodes.indexOf(a.dataElementCode);
      const indexB = dataBuilderConfig.dataElementCodes.indexOf(b.dataElementCode);
      return indexA - indexB;
    });
  }

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

  if (dataBuilderConfig.dataElementCodes) {
    dataBuilderConfig.dataElementCodes.forEach(dataElementCode => {
      const name = labels[dataElementCode] || dataElementCodeToName[dataElementCode];
      if (!dataElementsWithData.includes(dataElementCode)) {
        data.push({
          name,
          dataElementCode,
          value: NO_DATA_AVAILABLE,
        });
      }
    });
  }

  return { data, period };
};

export const sumLatestPerMetric = async (queryConfig, aggregator, dhisApi) =>
  sumPerMetric(
    queryConfig,
    aggregator,
    dhisApi,
    aggregator.aggregationTypes.SUM_MOST_RECENT_PER_FACILITY,
  );

export const sumAllPerMetric = async (queryConfig, aggregator, dhisApi) =>
  sumPerMetric(queryConfig, aggregator, dhisApi, aggregator.aggregationTypes.SUM);
