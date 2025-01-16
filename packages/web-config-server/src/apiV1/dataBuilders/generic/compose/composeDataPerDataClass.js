import { fetchComposedData } from '/apiV1/dataBuilders/helpers';
import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';

/**
 * Configuration schema
 * @typedef {Object} ComposeDataConfig
 * @property {string} sortOrder
 * @property {Object<string, { dataBuilder, dataBuilderConfig }>} dataBuilders
 *
 * Example config:
 * {
 *   dataBuilders: {
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
 *        data: [{name: dataClass1: value: '111'}, {name: dataClass2: value: '222'}]
 *     },
 *     builder2: {
 *        data: [{name: dataClass1: value: '333'}, {name: dataClass2: value: '444'}],
 *     }
 * }
 *
 * The above will then be converted to the below and returned:
 * {
 *    data:
 *        [
 *          { name: dataClass1, builder1: '111', builder2: '333' },
 *          { name: dataClass2, builder1: '222', builder2: '444' },
 *        ]
 * }
 */

export const composeDataPerDataClass = async (config, aggregator, dhisApi) => {
  const responses = await fetchComposedData(config, aggregator, dhisApi);
  const dataObject = {};

  Object.entries(responses).forEach(([responseName, { data: responseData }]) => {
    if (!responseData || responseData.length === 0) return;
    responseData.forEach(responseObject => {
      const { name: dataClassName, value } = responseObject;

      if (!dataObject[dataClassName]) {
        dataObject[dataClassName] = {};
        dataObject[dataClassName].name = dataClassName;
      }

      if (responseObject[`${dataClassName}_metadata`]) {
        dataObject[dataClassName][`${responseName}_metadata`] =
          responseObject[`${dataClassName}_metadata`];
      }

      dataObject[dataClassName][responseName] = value;
    });
  });

  // Fill 'No Data' value for any response with no data
  const data = Object.values(dataObject).map(dataClassObject => {
    let newDataClassObject = dataClassObject;
    Object.keys(responses).forEach(responseName => {
      if (newDataClassObject[responseName] === undefined) {
        newDataClassObject = {
          ...newDataClassObject,
          [responseName]: NO_DATA_AVAILABLE,
        };
      }
    });

    return newDataClassObject;
  });

  return { data };
};
