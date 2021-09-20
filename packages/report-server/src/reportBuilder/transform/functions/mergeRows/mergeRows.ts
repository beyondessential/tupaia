/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { TransformParser } from '../../parser';
import { mergeStrategies } from './mergeStrategies';
import { buildWhere } from '../where';
import { Context, Row, FieldValue } from '../../../types';
import { buildCreateGroupKey } from './createGroupKey';
import { buildGetMergeStrategy } from './getMergeStrategy';
import { starSingleOrMultipleColumnsValidator } from '../transformValidators';

type MergeRowsParams = {
  createGroupKey: (row: Row) => string;
  getMergeStrategy: (field: string) => keyof typeof mergeStrategies;
  where: (parser: TransformParser) => boolean;
};

const paramsValidator = yup.object().shape({
  groupBy: starSingleOrMultipleColumnsValidator,
  using: yup.lazy((value: unknown) => {
    const optionalMergeStrategyNameValidator = yup
      .mixed<keyof typeof mergeStrategies>()
      .oneOf(Object.keys(mergeStrategies) as (keyof typeof mergeStrategies)[]);
    if (value === undefined) {
      return optionalMergeStrategyNameValidator;
    }

    const mergeStrategyNameValidator = optionalMergeStrategyNameValidator.required();
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

const groupRows = (rows: Row[], params: MergeRowsParams, context: Context) => {
  const groupsByKey: Record<string, Group> = {};
  const parser = new TransformParser(rows, context);
  const ungroupedRows: Row[] = []; // Rows that don't match the 'where' clause are left ungrouped

  rows.forEach((row: Row) => {
    if (!params.where(parser)) {
      ungroupedRows.push(row);
      parser.next();
      return;
    }
    const groupKey = params.createGroupKey(row);
    groupsByKey[groupKey] = addRowToGroup(groupsByKey[groupKey] || {}, row);
    parser.next();
  });

  return { groups: Object.values(groupsByKey), ungroupedRows };
};

const addRowToGroup = (group: Group, row: Row): Group => {
  const newGroup = { ...group };
  Object.keys(row).forEach((field: string) => {
    newGroup[field] = [...(newGroup[field] || []), row[field]];
  });
  return newGroup;
};

const mergeGroups = (groups: Group[], params: MergeRowsParams): Row[] => {
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

const mergeRows = (rows: Row[], params: MergeRowsParams): Row[] => {
  const { groups, ungroupedRows } = groupRows(rows, params);
  const mergedRows = mergeGroups(groups, params);
  return mergedRows.concat(ungroupedRows);
};

const buildParams = (params: unknown): MergeRowsParams => {
  const validatedParams = paramsValidator.validateSync(params);

  const { groupBy, using } = validatedParams;

  return {
    createGroupKey: buildCreateGroupKey(groupBy),
    getMergeStrategy: buildGetMergeStrategy(groupBy, using),
    where: buildWhere(params),
  };
};

export const buildMergeRows = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => mergeRows(rows, builtParams);
};
