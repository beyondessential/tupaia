/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';
import zipObject from 'lodash.zipobject';

import { addPrefixToCell } from './TableConfig';
import {
  countAnalyticsThatSatisfyConditions,
  divideValues,
  calculateOperationForAnalytics,
} from '/apiV1/dataBuilders/helpers';
import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';

const groupByMetadata = (groupedResults, metadataField) => {
  const newResults = {};
  const addResult = (cell, result) => {
    const newCell = addPrefixToCell(cell, result[metadataField]);
    newResults[newCell] = (newResults[newCell] || []).concat(result);
  };

  Object.entries(groupedResults).forEach(([cell, resultGroup]) => {
    resultGroup.forEach(result => addResult(cell, result));
  });

  return newResults;
};

/**
 * Creates a map of cell keys to values that will be used to calculate cell values.
 * In the simplest case, the data elements are mapped to their values;
 * if metadata categories are used, the keys also include metadata information
 *
 * @param {Config} config
 * @param {Object[]} results
 * @returns {Object<string, (number|string)>}
 */
export const getValuesByCell = (config, results) => {
  let groupedResults = groupBy(results, 'dataElement');

  if (config.hasMetadataRowCategories()) {
    groupedResults = groupByMetadata(groupedResults, config.getRowMetadataField());
  }
  if (config.hasMetadataColumnCategories()) {
    groupedResults = groupByMetadata(groupedResults, config.getColumnMetadataField());
  }

  return zipObject(
    Object.keys(groupedResults),
    Object.values(groupedResults).map(([{ value, metadata }]) =>
      metadata && metadata.options ? metadata.options[value] : value,
    ),
  );
};

export const getPercentageCountOfValuesByCell = (cells, results) => {
  const percentageCountOfValuesByCell = {};
  cells.forEach(cell => {
    percentageCountOfValuesByCell[cell.key] = divideValues(
      countAnalyticsThatSatisfyConditions(results, cell.numerator),
      countAnalyticsThatSatisfyConditions(results, cell.denominator),
    );
  });
  return percentageCountOfValuesByCell;
};

export const getCalculatedValuesByCell = async (cells, results, hierarchyId) => {
  const calculatedValuesByCell = {};
  await Promise.all(
    cells.map(async cell => {
      if (typeof cell === 'string') {
        const analyticForCell = results.find(result => result.dataElement === cell) || {};
        calculatedValuesByCell[cell] = analyticForCell.value ?? NO_DATA_AVAILABLE;
      } else {
        calculatedValuesByCell[cell.key] = await calculateOperationForAnalytics(results, {
          ...cell,
          hierarchyId,
        });
      }
    }),
  );
  return calculatedValuesByCell;
};

export const getDataElementsFromCell = cell =>
  typeof cell === 'string'
    ? cell
    : cell.dataElement || // Single dataElement
      (cell.operands && cell.operands.map(operand => operand.dataValues)) || // Arithmetic operators
      (cell.dataElementToString && Object.keys(cell.dataElementToString)) || // COMBINE_BINARY_AS_STRING
      [];
