/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { checkValueSatisfiesCondition } from '@tupaia/utils';

const percentageOfConditions = (valueSet, config) => {
  const { numerator: numeratorConfig } = config;
  const numerator = valueSet.filter(value =>
    checkValueSatisfiesCondition(value, numeratorConfig.condition),
  ).length;
  const denominator = valueSet.length;
  return `${((numerator / denominator) * 100).toFixed(0)}%`;
};

const OPERATORS = {
  PERCENTAGE: percentageOfConditions,
};

/**
 * To add summary for each column in final data
 * 
 * Configuration schema
 * For example:
 * ------------------------------------------------------
 *                               | Male condoms     |   yes
 *                               | Female condoms   |   no
 * (New Row for column summary)  | Percentage of no |   50% 
 * ------------------------------------------------------
 * 
 * @param {columns, rows, period} result: Matrix table data
 * @param { operator, title<optional>, operatorConfig, excludeCondition<optional>} config
 *    
 * Config example:
 * ------------------------------------------------------
 *  columnSummary: {
      title: '% of items out of stock at facility',
      operator: 'PERCENTAGE',
      operatorConfig: {
        numerator: {
          condition: {
            value: 'No',
            operator: '=',
          },
        },
      },
      excludeCondition: { value: 'No data', operator: '=' },
    },
 *-----------------------------------------------------
 * 
 */
export const buildColumnSummary = (result, config) => {
  const newResult = result;
  const { excludeCondition, operator: operatorName, title = 'Summary', operatorConfig } = config;
  const newRow = { dataElement: title };
  const operator = OPERATORS[operatorName];
  if (!operator) throw new Error(`Cannot find operator: ${operatorName}`);

  // Add summary to each column
  newResult.columns.forEach(({ key }) => {
    const columnValuesSet = newResult.rows.map(row => row[key]);
    const filteredColumnValuesSet = excludeCondition
      ? columnValuesSet.filter(value => !checkValueSatisfiesCondition(value, excludeCondition))
      : columnValuesSet;
    newRow[key] = operator(filteredColumnValuesSet, operatorConfig);
  });
  newResult.rows.push(newRow);
  return newResult;
};

/**
 * To add summary for each row in final data
 * 
 * For example:
 * ------------------------------------------------------
 *                                           % of no (add new row summary)
 *  male condoms     | yes | no | yes | no |  50%
 * ------------------------------------------------------
 * 
 * @param {columns, rows, period} result: Matrix table data
 * @param { operator, title<optional>, operatorConfig, excludeCondition<optional>} config
 *    
 * Config example:
 * ------------------------------------------------------
 *  rowSummary: {
      title: '% of facilities with item out of stock',
      operator: 'PERCENTAGE',
      operatorConfig: {
        numerator: {
          condition: {
            value: 'No',
            operator: '=',
          },
        },
      },
      excludeCondition: { value: 'No data', operator: '=' },
    },
 *-----------------------------------------------------
 * 
 */
export const buildRowSummary = (result, config) => {
  const newResult = result;
  const newColumnKey = 'rowSummary';
  const { excludeCondition, operator: operatorName, title = 'Summary', operatorConfig } = config;
  const operator = OPERATORS[operatorName];
  if (!operator) throw new Error(`Cannot find operator: ${operatorName}`);

  const columnKeys = newResult.columns.map(row => row.key);
  // Add summary to each row
  newResult.rows.forEach((row, index) => {
    const rowValuesSet = columnKeys.map(key => row[key]);
    const filteredRowValuesSet = excludeCondition
      ? rowValuesSet.filter(value => !checkValueSatisfiesCondition(value, excludeCondition))
      : rowValuesSet;
    newResult.rows[index][newColumnKey] = operator(filteredRowValuesSet, operatorConfig);
  });

  // Add summary column to columns object
  const newColumn = { key: newColumnKey, title };
  result.columns.push(newColumn);
  return newResult;
};
