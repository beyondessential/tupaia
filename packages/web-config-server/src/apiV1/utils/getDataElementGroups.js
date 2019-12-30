/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

/**
 * @typedef DataElementGroup
 * @property {string} code
 * @property {string} name
 * @property {Array.<{ id: string, code: string }>} dataElements
 */

/**
 * @param {DhisApi} dhisApi
 * @param {string[]} groupCodes
 * @returns {DataElementGroup[]}
 */
export const getDataElementGroups = async (dhisApi, groupCodes) => {
  const results = await dhisApi.getRecords({
    type: 'dataElementGroups',
    codes: groupCodes,
    fields: 'code,name,dataElements[id,code]',
  });
  if (results === null || results.length === 0) {
    return null;
  }

  const dataElementGroups = {};
  results.forEach(dataElementGroup => {
    const { code } = dataElementGroup;
    dataElementGroups[code] = dataElementGroup;
  });

  return dataElementGroups;
};
