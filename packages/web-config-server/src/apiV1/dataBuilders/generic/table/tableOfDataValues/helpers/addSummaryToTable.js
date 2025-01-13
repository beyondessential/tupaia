import { checkValueSatisfiesCondition } from '@tupaia/utils';

const percentageOfConditions = (valueSet, config) => {
  const cleanedValueSet = valueSet.filter(value => value !== undefined);
  if (cleanedValueSet.length === 0) return false;
  const { numerator: numeratorConfig } = config;
  const numerator = cleanedValueSet.filter(value =>
    checkValueSatisfiesCondition(value, numeratorConfig.condition),
  ).length;
  const denominator = cleanedValueSet.length;
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
    const summaryRowValue = operator(filteredColumnValuesSet, operatorConfig);
    if (summaryRowValue) {
      summaryRow[key] = summaryRowValue;
    }
  });
  const newRows = [...newTableData.rows, summaryRow];
  return { ...newTableData, rows: newRows };
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
  const summaryColumnKey = 'rowSummary';
  const {
    excludeCondition,
    operator: operatorName,
    title = 'Summary',
    operatorConfig,
    skipRowForColumnSummary,
  } = config;
  const operator = OPERATORS[operatorName];
  if (!operator) throw new Error(`Cannot find operator: ${operatorName}`);

  const columnKeys = tableData.columns.map(row => row.key);
  // Add summary to each row
  const newRows = tableData.rows.map((row, index) => {
    // Skip if it is a summary row
    if (index === tableData.rows.length - 1 && skipRowForColumnSummary) return row;

    const rowValuesSet = columnKeys.map(key => row[key]);
    const filteredRowValuesSet = excludeCondition
      ? rowValuesSet.filter(value => !checkValueSatisfiesCondition(value, excludeCondition))
      : rowValuesSet;
    const summaryCell = operator(filteredRowValuesSet, operatorConfig);
    if (summaryCell) {
      return { ...row, [summaryColumnKey]: summaryCell };
    }
    return row;
  });

  // Add summary column to columns object
  const newColumns = [...tableData.columns, { key: summaryColumnKey, title }];
  return { ...tableData, columns: newColumns, rows: newRows };
};
