import { getOptionSetOptions } from './getOptionSetOptions';

/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

/**
 * @typedef {{ id, code, name, optionSet: (Object|undefined) }} DataElement
 */

/**
 * @param {DhisApi} dhisApi
 * @param {string[]} dataElementCodes
 * @param {boolean} shouldIncludeOptions
 * @returns {Promise<Object<string, DataElement>>} A map of data element codes to data elements
 */
export const getDataElementsFromCodes = async (dhisApi, dataElementCodes, shouldIncludeOptions) => {
  const { dataElements } = await dhisApi.fetch('dataElements', {
    filter: `code:in:[${dataElementCodes}]`,
    fields: `id,code,name${shouldIncludeOptions ? ',optionSet' : ''}`,
  });

  const dataElementsByCode = {};
  for (let i = 0; i < dataElements.length; i++) {
    const { code, optionSet, ...restOfDataElement } = dataElements[i];

    dataElementsByCode[code] = { ...restOfDataElement, code };
    if (optionSet && optionSet.id) {
      dataElementsByCode[code].options = await getOptionSetOptions(dhisApi, { id: optionSet.id });
    }
  }

  return dataElementsByCode;
};
