/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { TransformParser } from '../../parser';
import { mergeStrategies } from './mergeStrategies';
import { buildWhere } from '../where';
import { Row, FieldValue } from '../../../types';
import { buildCreateGroupKey } from './createGroupKey';
import { buildGetMergeStrategy } from './getMergeStrategy';
import { functions } from '../../../functions';
import { starSingleOrMultipleColumnsValidator } from '../transformValidators';

type GroupRowsParams = {
  createGroupKey: (row: Row) => string;
  getMergeStrategy: (field: string) => keyof typeof mergeStrategies;
  where: (parser: TransformParser) => boolean;
};

const paramsValidator = yup.object().shape({
  by: starSingleOrMultipleColumnsValidator,
  mergeUsing: yup.lazy((value: unknown) => {
    const mergeStrategyNameValidator = yup
      .mixed<keyof typeof mergeStrategies>()
      .oneOf(Object.keys(mergeStrategies) as (keyof typeof mergeStrategies)[])
      .required();
    if (typeof value === 'string') {
      return mergeStrategyNameValidator;
    }

    if (typeof value === 'object' && value !== null) {
      const mergeStrategyMapValidator = Object.fromEntries(
        Object.entries(value).map(([columnName]) => [columnName, mergeStrategyNameValidator]),
      );
      return yup.object().shape(mergeStrategyMapValidator);
    }

    throw new yup.ValidationError(
      'mergeUsing must be either a single merge strategy, or a mapping between columns and merge strategies',
    );
  }),
  where: yup.string(),
});

/**
 * A group represents a key of fields, to all the values each row in that group had for the respective field
 *
 * eg.
 * [{orgUnit: TO, BCD1: 4 }, {orgUnit: TO, BCD1: 7 }], groupBy orgUnit => group: { BCD1: [4, 7] }
 */
type Group = {
  [fieldKey: string]: FieldValue[];
};

const buildGroups = (rows: Row[], params: GroupRowsParams) => {
  const groupsByKey: Record<string, Group> = {};
  const parser = new TransformParser(rows, functions);
  const ungroupedRows: Row[] = []; // Rows that don't match the 'where' clause are left ungrouped

  rows.forEach((row: Row) => {
    if (!params.where(parser)) {
      ungroupedRows.push(row);
      parser.next();
      return;
    }
    const groupKey = params.createGroupKey(row);
    groupsByKey[groupKey] = merge(groupsByKey[groupKey] || {}, row);
    parser.next();
  });

  return { groups: Object.values(groupsByKey), ungroupedRows };
};

const merge = (previousRow: Group, newRow: Row): Group => {
  const mergedRow = { ...previousRow };
  Object.keys(newRow).forEach((field: string) => {
    mergedRow[field] = [...(mergedRow[field] || []), newRow[field]];
  });
  return mergedRow;
};

const mergeGroups = (groups: Group[], params: GroupRowsParams): Row[] => {
  return groups.map(group => {
    const mergedRow: Row = {};
    Object.entries(group).forEach(([fieldKey, fieldValue]) => {
      const mergeStrategy = params.getMergeStrategy(fieldKey);
      const mergedValue = mergeStrategies[mergeStrategy](fieldValue);
      if (mergedValue !== undefined) {
        mergedRow[fieldKey] = mergedValue;
      }
    });
    return mergedRow;
  });
};

const groupRows = (rows: Row[], params: GroupRowsParams): Row[] => {
  const { groups, ungroupedRows } = buildGroups(rows, params);
  const mergedRows = mergeGroups(groups, params);
  return mergedRows.concat(ungroupedRows);
};

const buildParams = (params: unknown): GroupRowsParams => {
  const validatedParams = paramsValidator.validateSync(params);

  const { by, mergeUsing } = validatedParams;

  return {
    createGroupKey: buildCreateGroupKey(by),
    getMergeStrategy: buildGetMergeStrategy(by, mergeUsing),
    where: buildWhere(params),
  };
};

export const buildGroupRows = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => groupRows(rows, builtParams);
};
