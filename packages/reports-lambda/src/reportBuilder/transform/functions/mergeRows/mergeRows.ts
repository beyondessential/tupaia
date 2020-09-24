import { parseParams } from '../../../functions';
import { mergeFunctions } from './mergeFunctions';
import { where } from '../where';

export const mergeRows = (rows, params) => {
  const groupedRows = {};
  const otherRows = [];
  rows.forEach(row => {
    if (!where(row, params)) {
      otherRows.push(row);
      return;
    }
    const parsedParams = parseParams(row, params);
    const { group } = parsedParams;
    const groupKey = createGroupKey(row, group);
    groupedRows[groupKey] = merge(groupedRows[groupKey] || {}, row, parsedParams);
  });
  return Object.values(groupedRows).concat(otherRows);
};

const createGroupKey = (row, groupByFields) => {
  return groupByFields ? groupByFields.map(field => `${row[field]}`).join('|') : '*';
};

const merge = (mergedRow, newRow, params) => {
  Object.entries(newRow).forEach(([field, value]) => {
    getFieldMergeFunction(field, params)(mergedRow, field, value);
  });
  return mergedRow;
};

const getFieldMergeFunction = (field, params) => {
  const mergeFunctionName = Object.keys(mergeFunctions).find(
    mergeFunction => params[mergeFunction] && params[mergeFunction].includes(field),
  );
  return mergeFunctionName ? mergeFunctions[mergeFunctionName] : mergeFunctions.default;
};
