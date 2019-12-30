/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { sanitizeValue } from './sanitizeValue';

const DEFAULT_CONFIGURATION = {
  sortOrder: 'asc',
};

/**
 * Generic function to translate analytic responses to usable array of json elements
 *
 * @param {Object} response
 * @param {Object} translationConfiguration
 * @returns {{ results: AnalyticsResult[], metadata: (AnalyticsMetadata|undefined) }}
 */
export const translateDataValueResponse = (response, translationConfiguration = {}) => {
  const { sortOrder, includeAllHeaders, extraHeaders } = {
    ...DEFAULT_CONFIGURATION,
    ...translationConfiguration,
  };
  const headers = buildHeaders(response.headers, extraHeaders, includeAllHeaders);
  const results = [];

  response.rows.forEach(element => {
    const outJson = {};
    Object.entries(headers).forEach(([key, columnDescription]) => {
      const elementValue = element[columnDescription.columnIndex];
      outJson[key] = sanitizeValue(elementValue, columnDescription.columnType);
    });
    results.push(outJson);
  });

  results.sort((one, two) =>
    sortOrder === 'asc' ? one.period - two.period : two.period - one.period,
  );
  return response.metaData.dimensions
    ? { results, metadata: getDimensionMetadata(response) }
    : results;
};

// Headers to include in return array
const includeHeaders = {
  value: 'value',
  period: 'pe',
  organisationUnit: 'ou',
  dataElement: 'dx',
};

// Convert headers from analytic to following format
// {value: 3, period: 2, organistaionUnit: 0, dataElement: 1}
const buildHeaders = (headersArray, extraHeaders = {}, includeAllHeaders) => {
  const returnHeaders = {};
  const allHeaders = {};
  if (includeAllHeaders) {
    headersArray.forEach(headerRow => {
      allHeaders[headerRow.column] = headerRow.name;
    });
  }
  const useHeaders = { ...includeHeaders, ...extraHeaders, ...allHeaders };
  const headerMatchesKeys = Object.keys(useHeaders);

  let headerCount = 0;
  headersArray.forEach(header => {
    headerMatchesKeys.some(key => {
      if (useHeaders[key] === header.name) {
        returnHeaders[key] = { columnIndex: headerCount, columnType: header.valueType };
        return true;
      }
      return false;
    });
    headerCount += 1;
  });
  return returnHeaders;
};

// function will parse and convert metadata dimensions, see before after below
export const getDimensionMetadata = response => {
  const returnObj = {
    dataElementCodeToName: {},
    dataElementIdToCode: {},
  };
  const dimensions = response.metaData.dimensions;
  const metadataItems = response.metaData.items;
  // reverseHeaders for quicker mapping
  const reverseHeaders = {};
  Object.entries(includeHeaders).forEach(([key, value]) => {
    reverseHeaders[value] = key;
  });

  Object.keys(dimensions).forEach(key => {
    const correspondingHeader = reverseHeaders[key];
    // if object has not been defined for the key
    if (!returnObj[correspondingHeader]) returnObj[correspondingHeader] = {};
    dimensions[key].forEach(dimensionIdentifier => {
      returnObj[correspondingHeader][dimensionIdentifier] = metadataItems[dimensionIdentifier].name;
      if (correspondingHeader === 'dataElement') {
        returnObj.dataElementCodeToName[metadataItems[dimensionIdentifier].code] =
          metadataItems[dimensionIdentifier].name;
        returnObj.dataElementIdToCode[dimensionIdentifier] =
          metadataItems[dimensionIdentifier].code;
      }
    });
  });

  return returnObj;
};

/* Typical Inputs

***** input for translator

{ headers:
   [ { name: 'dx',
       column: 'Data',
       valueType: 'TEXT',
       type: 'java.lang.String',
       hidden: false,
       meta: true },
     { name: 'pe',
       column: 'Period',
       valueType: 'TEXT',
       type: 'java.lang.String',
       hidden: false,
       meta: true },
     { name: 'ou',
       column: 'Organisation unit',
       valueType: 'TEXT',
       type: 'java.lang.String',
       hidden: false,
       meta: true },
     { name: 'value',
       column: 'Value',
       valueType: 'NUMBER',
       type: 'java.lang.Double',
       hidden: false,
       meta: false } ],
  width: 4,
  height: 12,
  rows:
   [ [ 'bbbbbbbbbbb', '201606', 'nckZedYVHfU', '51.7' ],
     [ 'bbbbbbbbbbb', '201701', 'nckZedYVHfU', '46.5' ],
     [ 'bbbbbbbbbbb', '201608', 'nckZedYVHfU', '50.1' ],
     [ 'bbbbbbbbbbb', '201702', 'nckZedYVHfU', '45.2' ],
     [ 'bbbbbbbbbbb', '201611', 'nckZedYVHfU', '42.4' ],
     [ 'bbbbbbbbbbb', '201605', 'nckZedYVHfU', '46.6' ],
     [ 'bbbbbbbbbbb', '201609', 'nckZedYVHfU', '47.7' ],
     [ 'bbbbbbbbbbb', '201704', 'nckZedYVHfU', '45.4' ],
     [ 'bbbbbbbbbbb', '201612', 'nckZedYVHfU', '46.3' ],
     [ 'bbbbbbbbbbb', '201703', 'nckZedYVHfU', '41.1' ],
     [ 'bbbbbbbbbbb', '201610', 'nckZedYVHfU', '44.4' ],
     [ 'bbbbbbbbbbb', '201607', 'nckZedYVHfU', '49.9' ] ] }

***** input for getDimensionMetadata

{ headers:
   [ { name: 'dx',
       column: 'Data',
       valueType: 'TEXT',
       type: 'java.lang.String',
       hidden: false,
       meta: true },
     { name: 'pe',
       column: 'Period',
       valueType: 'TEXT',
       type: 'java.lang.String',
       hidden: false,
       meta: true },
     { name: 'ou',
       column: 'Organisation unit',
       valueType: 'TEXT',
       type: 'java.lang.String',
       hidden: false,
       meta: true },
     { name: 'value',
       column: 'Value',
       valueType: 'NUMBER',
       type: 'java.lang.Double',
       hidden: false,
       meta: false } ],
  metaData:
   { items:
      { '201705': { name: 'May 2017' },
        '201706': { name: 'June 2017' },
        fffffffffff: { name: 'Percentage value of equipment' },
        dx: { name: 'Data' },
        jlNb4luBgdv: { name: 'Temanoku' },
        ggggggggggg: { name: 'Percentage value of testing kits' },
        pe: { name: 'Period' },
        ou: { name: 'Organisation unit' },
        HllvX50cXC0: { name: 'default' },
        eeeeeeeeeee: { name: 'Percentage value of medicines' },
        ddddddddddd: { name: 'Percentage value of consumables' } },
     dimensions:
      { dx: [ 'ddddddddddd', 'fffffffffff', 'eeeeeeeeeee', 'ggggggggggg' ],
        pe: [ '201706', '201705' ],
        ou: [ 'jlNb4luBgdv' ],
        co: [ 'HllvX50cXC0' ] } },
  width: 4,
  height: 4,
  rows:
   [ [ 'fffffffffff', '201705', 'jlNb4luBgdv', '20.0' ],
     [ 'ddddddddddd', '201705', 'jlNb4luBgdv', '10.0' ],
     [ 'ggggggggggg', '201705', 'jlNb4luBgdv', '40.0' ],
     [ 'eeeeeeeeeee', '201705', 'jlNb4luBgdv', '30.0' ] ] }
*/
