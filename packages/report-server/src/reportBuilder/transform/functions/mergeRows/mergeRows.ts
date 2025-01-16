import { yup } from '@tupaia/utils';
import { yupTsUtils } from '@tupaia/tsutils';

import { mergeStrategies } from './mergeStrategies';
import { FieldValue, Row } from '../../../types';
import { buildCreateGroupKey } from './createGroupKey';
import { buildGetMergeStrategy } from './getMergeStrategy';
import { starSingleOrMultipleColumnsValidator } from '../utils';
import { TransformTable } from '../../table';

type MergeRowsParams = {
  createGroupKey: (row: Row) => string;
  getMergeStrategy: (field: string) => keyof typeof mergeStrategies;
};

const optionalMergeStrategyNameValidator = yup
  .mixed<keyof typeof mergeStrategies>()
  .oneOf(Object.keys(mergeStrategies) as (keyof typeof mergeStrategies)[]);
const mergeStrategyNameValidator = optionalMergeStrategyNameValidator.required();

export const paramsValidator = yup.object().shape({
  groupBy: starSingleOrMultipleColumnsValidator,
  using: yupTsUtils.describableLazy(
    (value: unknown) => {
      if (value === undefined) {
        return optionalMergeStrategyNameValidator;
      }

      if (typeof value === 'string') {
        return mergeStrategyNameValidator;
      }

      if (typeof value === 'object' && value !== null) {
        const mergeStrategyMapValidator = Object.fromEntries(
          Object.entries(value).map(([columnName]) => [columnName, mergeStrategyNameValidator]),
        );
        return yup.object().shape(mergeStrategyMapValidator).required();
      }

      throw new yup.ValidationError(
        'mergeUsing must be either a single merge strategy, or a mapping between columns and merge strategies',
      );
    },
    [optionalMergeStrategyNameValidator, yup.object().shape({})],
  ),
  where: yup.string(),
});

/**
 * A group represents a key of fields, to all the values each row in that group had for the respective field
 *
 * eg.
 * [{orgUnit: TO, BCD1: 4 }, {orgUnit: TO, BCD1: 7 }], groupBy orgUnit => group: { BCD1: [4, 7] }
 */
type Group = {
  [columnName: string]: FieldValue[];
};

const groupRows = (table: TransformTable, params: MergeRowsParams) => {
  const groupsByKey: Record<string, Group> = {};

  table.getRows().forEach((row: Row) => {
    const groupKey = params.createGroupKey(row);
    addRowToGroup(groupsByKey, groupKey, row); // mutates groupsByKey
  });

  return Object.values(groupsByKey);
};

const addRowToGroup = (groupsByKey: Record<string, Group>, groupKey: string, row: Row) => {
  if (!groupsByKey[groupKey]) {
    // eslint-disable-next-line no-param-reassign
    groupsByKey[groupKey] = {};
  }

  const group = groupsByKey[groupKey];

  Object.entries(row).forEach(([columnName, value]) => {
    if (!group[columnName]) {
      // eslint-disable-next-line no-param-reassign
      group[columnName] = [];
    }
    group[columnName].push(value);
  });
};

const mergeGroups = (groups: Group[], params: MergeRowsParams) => {
  const excludedColumns = new Set<string>();
  const mergedRows = groups.map(group => {
    const mergedRow: Row = {};
    Object.entries(group).forEach(([columnName, groupValues]) => {
      const mergeStrategy = params.getMergeStrategy(columnName);

      // We track the excluded columns so that we can remove them from the TransformTable later
      if (mergeStrategy === 'exclude') {
        excludedColumns.add(columnName);
      }

      const mergedValue = mergeStrategies[mergeStrategy](groupValues);
      if (mergedValue !== undefined) {
        mergedRow[columnName] = mergedValue;
      }
    });
    return mergedRow;
  });
  return { mergedRows, excludedColumns: Array.from(excludedColumns) };
};

const mergeRows = (table: TransformTable, params: MergeRowsParams) => {
  const groups = groupRows(table, params);
  const { mergedRows, excludedColumns } = mergeGroups(groups, params);
  const columns = table.getColumns().filter(columnName => !excludedColumns.includes(columnName));
  return new TransformTable(columns, mergedRows);
};

const buildParams = (params: unknown): MergeRowsParams => {
  const validatedParams = paramsValidator.validateSync(params);

  const { groupBy, using } = validatedParams;

  return {
    createGroupKey: buildCreateGroupKey(groupBy),
    getMergeStrategy: buildGetMergeStrategy(groupBy, using),
  };
};

export const buildMergeRows = (params: unknown) => {
  const builtParams = buildParams(params);
  return (table: TransformTable) => mergeRows(table, builtParams);
};
