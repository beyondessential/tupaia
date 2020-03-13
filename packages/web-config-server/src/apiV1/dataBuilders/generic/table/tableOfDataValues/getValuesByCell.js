/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';
import zipObject from 'lodash.zipobject';

import { addPrefixToCell } from './TableConfig';

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
