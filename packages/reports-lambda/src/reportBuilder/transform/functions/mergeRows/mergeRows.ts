import { mergeFunctions } from './mergeFunctions';
import { buildWhere } from '../where';
import { Row } from '../../../reportBuilder';
import { buildCreateGroupKey } from './createGroupKey';
import { buildGetFieldMergeFunction } from './getFieldMergeFunction';

type MergeParams = {
  createGroupKey: (row: Row) => string;
  getFieldMergeFunction: (row: Row, field: string) => keyof typeof mergeFunctions;
  where: (row: Row) => boolean;
};

const merge = (mergedRow: Row, newRow: Row, params: MergeParams): Row => {
  Object.keys(newRow).forEach((field: string) => {
    const mergeFunction = params.getFieldMergeFunction(newRow, field);
    mergeFunctions[mergeFunction](mergedRow, field, newRow[field]);
  });
  return mergedRow;
};

const mergeRows = (rows: Row[], params: MergeParams): Row[] => {
  const groupedRows: { [groupKey: string]: Row } = {};
  const otherRows: Row[] = [];

  rows.forEach((row: Row) => {
    if (!params.where(row)) {
      otherRows.push(row);
      return;
    }
    const groupKey = params.createGroupKey(row);
    groupedRows[groupKey] = merge(groupedRows[groupKey] || {}, row, params);
  });
  return Object.values(groupedRows).concat(otherRows);
};

const buildParams = (params: unknown): MergeParams => {
  if (typeof params !== 'object' || params === null) {
    throw new Error(`Expected params object but got ${params}`);
  }

  const { where, default: defaultMergeFunction, ...restOfParams } = params;

  Object.values(restOfParams).forEach(paramValue => {
    if (!Array.isArray(paramValue)) {
      throw new Error(
        `Expected all merge function parameters to be an array of strings but got ${paramValue}`,
      );
    }
    if (!paramValue.every(paramValueItem => typeof paramValueItem === 'string')) {
      throw new Error(
        `Expected all merge function parameters items to be strings but got ${paramValue}`,
      );
    }
  });

  if (defaultMergeFunction !== undefined && typeof defaultMergeFunction !== 'string') {
    throw new Error(`Expected default to be a string but got ${defaultMergeFunction}`);
  }

  const { group } = restOfParams;
  return {
    createGroupKey: buildCreateGroupKey(group as string[] | undefined),
    getFieldMergeFunction: buildGetFieldMergeFunction(
      restOfParams as { [key: string]: string[] },
      defaultMergeFunction,
    ),
    where: buildWhere(params),
  };
};

export const buildMergeRows = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => mergeRows(rows, builtParams);
};
