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
 * Adds summary for each column in a table
 *

 * For example:
 * ------------------------------------------------------
 *                               | Male condoms     |   yes
 *                               | Female condoms   |   no
 * (New Row for column summary)  | Percentage of no |   50%
 * ------------------------------------------------------
 *
 * @param {{ columns, rows }} tableData: Matrix table data
 * @param {{ operator, title, operatorConfig, excludeCondition}} config
 *
 */
export const buildColumnSummary = (tableData, config) => {
  const newTableData = { ...tableData };
  const { excludeCondition, operator: operatorName, title = 'Summary', operatorConfig } = config;
  const summaryRow = { dataElement: title };
  const operator = OPERATORS[operatorName];
  if (!operator) throw new Error(`Cannot find operator: ${operatorName}`);

  // Add summary to each column
  newTableData.columns.forEach(({ key }) => {
    const columnValuesSet = newTableData.rows.map(row => row[key]);
    const filteredColumnValuesSet = excludeCondition
      ? columnValuesSet.filter(value => !checkValueSatisfiesCondition(value, excludeCondition))
      : columnValuesSet;
    summaryRow[key] = operator(filteredColumnValuesSet, operatorConfig);
  });
  newTableData.rows.push(summaryRow);
  return newTableData;
};

/**
 * Adds summary for each row in final data
 *
 * For example:
 * ------------------------------------------------------
 *                                           % of no (add new row summary)
 *  male condoms     | yes | no | yes | no |  50%
 * ------------------------------------------------------
 *
 * @param {{ columns, rows }} result: Matrix table data
 * @param {{ operator, title, operatorConfig, excludeCondition }} config
 *
 */
export const buildRowSummary = (tableData, config) => {
  const newTableData = { ...tableData };
  const summaryColumnKey = 'rowSummary';
  const { excludeCondition, operator: operatorName, title = 'Summary', operatorConfig } = config;
  const operator = OPERATORS[operatorName];
  if (!operator) throw new Error(`Cannot find operator: ${operatorName}`);

  const columnKeys = newTableData.columns.map(row => row.key);
  // Add summary to each row
  newTableData.rows.forEach((row, index) => {
    const rowValuesSet = columnKeys.map(key => row[key]);
    const filteredRowValuesSet = excludeCondition
      ? rowValuesSet.filter(value => !checkValueSatisfiesCondition(value, excludeCondition))
      : rowValuesSet;
    newTableData.rows[index][summaryColumnKey] = operator(filteredRowValuesSet, operatorConfig);
  });

  // Add summary column to columns object
  const newColumns = [...tableData.columns, { key: summaryColumnKey, title }];
  return { ...tableData, columns: newColumns };
};
