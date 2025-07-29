import { groupBy, isEqual, zipObject } from 'es-toolkit/compat';

import { DEFAULT_BINARY_OPTIONS_OBJECT } from '@tupaia/utils';

import { addPrefixToCell } from '/apiV1/dataBuilders/generic/table/tableOfDataValues/TableConfig';
import {
  calculateOperationForAnalytics,
  countAnalyticsThatSatisfyConditions,
  divideValues,
} from '/apiV1/dataBuilders/helpers';

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
      metadata && metadata.options && !isEqual(metadata.options, DEFAULT_BINARY_OPTIONS_OBJECT) // Metadata options are mainly used for translating data from DHIS2 that has category options. For internal data, it returns default Yes/No metadata options for binary data to support translating from 1/0 to Yes/No in a few other places. For matrices, particularly `tableOfDataValues` data builder, we want to use raw 1/0 values and don't want to apply this translation because we want to keep the values consistent. So this check is for disabling that special case.
        ? metadata.options[value]
        : value,
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

export const getCalculatedValuesByCell = async (models, cells, results, config) => {
  const calculatedValuesByCell = {};
  await Promise.all(
    cells.map(async cell => {
      if (typeof cell === 'string') {
        const analyticForCell = results.find(result => result.dataElement === cell) || {};
        calculatedValuesByCell[cell] = analyticForCell.value ?? config.noDataValue;
      } else {
        calculatedValuesByCell[cell.key] = await calculateOperationForAnalytics(models, results, {
          ...cell,
          ...config,
        });
      }
    }),
  );
  return calculatedValuesByCell;
};
