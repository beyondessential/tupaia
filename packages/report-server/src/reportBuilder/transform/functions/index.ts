/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Context } from '../../context';
import { Row } from '../../types';

import {
  buildInsertColumns,
  paramsValidator as insertColumnsParamsValidator,
} from './insertColumns';
import {
  buildExcludeColumns,
  paramsValidator as excludeColumnsParamsValidator,
} from './excludeColumns';
import {
  buildUpdateColumns,
  paramsValidator as updateColumnsParamsValidator,
} from './updateColumns';
import { buildMergeRows, paramsValidator as mergeRowsParamsValidator } from './mergeRows';
import { buildSortRows, paramsValidator as sortRowsParamsValidator } from './sortRows';
import { buildExcludeRows, paramsValidator as excludeRowsParamsValidator } from './excludeRows';
import { buildInsertRows, paramsValidator as insertRowsParamsValidator } from './insertRows';

type TransformBuilder = (params: unknown, context: Context) => (rows: Row[]) => Row[];

export const transformBuilders: Record<string, TransformBuilder> = {
  insertColumns: buildInsertColumns,
  excludeColumns: buildExcludeColumns,
  updateColumns: buildUpdateColumns,
  mergeRows: buildMergeRows,
  sortRows: buildSortRows,
  excludeRows: buildExcludeRows,
  insertRows: buildInsertRows,
};

export const transformSchemas: Record<
  string,
  {
    type: string;
    fields: Record<string, unknown>;
  }
> = {
  insertColumns: insertColumnsParamsValidator.describe(),
  excludeColumns: excludeColumnsParamsValidator.describe(),
  updateColumns: updateColumnsParamsValidator.describe(),
  mergeRows: mergeRowsParamsValidator.describe(),
  sortRows: sortRowsParamsValidator.describe(),
  excludeRows: excludeRowsParamsValidator.describe(),
  insertRows: insertRowsParamsValidator.describe(),
};
