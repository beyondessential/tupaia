// TODO: The code in this file is to implement a hacky approach to fetch indicator values
// because the normal analytics/rawData.json endpoint does not return any data for indicators.
// Will have to implement this properly with #tupaia-backlog/issues/2412
// After that remove this file and anything related to it

import { getSortByKey } from '@tupaia/utils';

/*
 * @typedef {{ dataElement, organisationUnit, period, value }} Analytic
 */

const DIMENSION_TRANSLATION = {
  dx: 'dataElement',
  ou: 'organisationUnit',
  pe: 'period',
  value: 'value',
};

const DIMENSION_TYPES = {
  DATA_ELEMENT: 'DATA_ELEMENT',
  INDICATOR: 'INDICATOR',
};

/**
 * @param {number|string} value
 * @param {string} valueType
 * @returns {number|string}
 */
const sanitizeValue = (value, valueType) => {
  if (valueType === 'NUMBER') {
    const sanitizedValue = parseFloat(value);
    return Number.isNaN(sanitizedValue) ? '' : sanitizedValue;
  }

  return value;
};

/**
 * @param {Object} dhisAnalytics
 * @returns {{ results: Analytic[], metadata: { dataElementCodeToName } }}
 */
export const buildAnalyticsFromDhisAnalytics = dhisAnalytics => {
  const { headers, rows, metaData: metadata } = dhisAnalytics;
  const columnSpecs = getColumnSpecs(headers);

  const results = [];
  rows.forEach(row => {
    const result = {};
    row.forEach((value, columnIndex) => {
      const { dimension, valueType } = columnSpecs[columnIndex];
      if (!dimension) {
        // Fields that are not specified in our dimension translation are excluded from the results
        return;
      }

      result[dimension] = sanitizeValue(value, valueType);
    });

    results.push(result);
  });

  return {
    results: results.sort(getSortByKey('period')),
    metadata: translateMetadata(metadata),
  };
};

const getColumnSpecs = headers => {
  const columnSpecs = new Array(headers.length).fill({});
  headers.forEach(({ name: dimension, valueType }, columnIndex) => {
    const translatedDimension = DIMENSION_TRANSLATION[dimension];
    if (translatedDimension) {
      columnSpecs[columnIndex] = { dimension: translatedDimension, valueType };
    }
  });

  return columnSpecs;
};

const translateMetadata = metadata => {
  const { items } = metadata;
  const dataElementCodeToName = {};
  for (const itemEntry of Object.entries(items)) {
    const [code, { name, dimensionItemType }] = itemEntry;
    if ([DIMENSION_TYPES.DATA_ELEMENT, DIMENSION_TYPES.INDICATOR].includes(dimensionItemType)) {
      dataElementCodeToName[code] = name;
    }
  }
  return { dataElementCodeToName };
};
