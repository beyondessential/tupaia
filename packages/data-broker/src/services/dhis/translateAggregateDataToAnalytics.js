/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getSortByKey, reduceToDictionary } from '@tupaia/utils';
import { sanitizeValue } from './sanitizeValue';

const DIMENSION_TRANSLATION = {
  dx: 'dataElement',
  ou: 'organisationUnit',
  pe: 'period',
  value: 'value',
};

const DIMENSION_TYPES = {
  DATA_ELEMENT: 'DATA_ELEMENT',
};

/**
 * @param {Object} response
 * @returns {{ results: AnalyticsResult[], metadata: AnalyticsMetadata }}
 */
export const translateAggregateDataToAnalytics = response => {
  const { headers, rows, metaData: metadata } = response;
  const headerConfig = getHeaderConfig(headers);

  const results = [];
  rows.forEach(row => {
    const result = {};
    Object.entries(headerConfig).forEach(([dimension, { columnIndex, valueType }]) => {
      const value = row[columnIndex];
      result[dimension] = sanitizeValue(value, valueType);
    });

    results.push(result);
  });

  return {
    results: results.sort(getSortByKey('period')),
    metadata: translateMetadata(metadata),
  };
};

const getHeaderConfig = headers => {
  const translatedHeaders = {};
  headers.forEach(({ name: dimension, valueType }, columnIndex) => {
    const translatedDimension = DIMENSION_TRANSLATION[dimension];
    if (translatedDimension) {
      translatedHeaders[translatedDimension] = { columnIndex, valueType };
    }
  });

  return translatedHeaders;
};

const translateMetadata = metadata => {
  const { items } = metadata;
  const dataElements = Object.values(items).filter(
    ({ dimensionItemType }) => dimensionItemType === DIMENSION_TYPES.DATA_ELEMENT,
  );

  return { dataElementCodeToName: reduceToDictionary(dataElements, 'code', 'name') };
};
