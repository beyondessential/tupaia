/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getSortByKey, reduceToDictionary } from '@tupaia/utils';
import { sanitizeValue } from './sanitizeValue';

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
  const dataElements = Object.values(items).filter(
    ({ dimensionItemType }) => dimensionItemType === DIMENSION_TYPES.DATA_ELEMENT,
  );

  return { dataElementCodeToName: reduceToDictionary(dataElements, 'code', 'name') };
};
