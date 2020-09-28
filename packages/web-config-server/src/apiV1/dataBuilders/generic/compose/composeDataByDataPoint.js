/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { fetchComposedData } from '/apiV1/dataBuilders/helpers';

/**
 * Configuration schema
 * @typedef {Object} ComposeDataConfig
 * @property {string} sortOrder
 * @property {Object<string, { dataBuilder, dataBuilderConfig }>} dataBuilders
 *
 * Example config:
 * {
 *   "dataBuilders": {
 *        builder1: {
 *            dataBuilder: <some databuilder>,
 *            dataBuilderConfig: <some config>,
 *        },
 *        builder2: {
 *            dataBuilder: <some databuilder>,
 *            dataBuilderConfig: <some config>,
 *        }
 *    }
 * }
 * 
 * Data returned from fetchComposedData():
 * {
 *     builder1: { 
 *        data: [{name: dataPoint1: value: '111'}, {name: dataPoint2: value: '222'}}
 *     },
 *     builder2: {
 *        data: [{name: dataPoint1: value: '333'}, {name: dataPoint2: value: '444'}},
 *     }
 * }
 * 
 * Will be converted and returned:
 * { 
 *    data: 
 *        [
 *          { name: dataPoint1, builder1: '111', builder2: '333' }, 
 *          { name: dataPoint2, builder1: '222', builder2: '444' }, 
 *        ]
 *    }
 */

export const composeDataByDataPoint = async (config, aggregator, dhisApi) => {
  const responses = await fetchComposedData(config, aggregator, dhisApi);
  const dataObject = {};

  Object.entries(responses).forEach(([responseName, { data: responseData }]) => {
    if (!responseData || responseData.length === 0) return;
    responseData.forEach(responseObject => {
      const { name: dataPointName, value } = responseObject;

      if (!dataObject[dataPointName]) {
        dataObject[dataPointName] = {};
        dataObject[dataPointName].name = dataPointName;
      }

      if (responseObject[`${dataPointName}_metadata`]) {
        dataObject[dataPointName][`${responseName}_metadata`] = responseObject[`${dataPointName}_metadata`];
      }

      dataObject[dataPointName][responseName] = value;
    });
  });

  return { data: Object.values(dataObject) };
};
