import { parseParams } from '../../../functions';
import { mergeFunctions } from './mergeFunctions';

export const mergeRows = (rows, params) => {
  const groupedRows = {};
  rows.forEach(row => {
    const parsedParams = parseParams(row, params);
    const { group } = parsedParams;
    const groupKey = createGroupKey(row, group);
    groupedRows[groupKey] = merge(groupedRows[groupKey] || {}, row, parsedParams);
  });
  return Object.values(groupedRows);
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
