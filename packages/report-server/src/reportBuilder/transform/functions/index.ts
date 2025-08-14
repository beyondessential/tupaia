import { yup } from '@tupaia/utils';
import { Context } from '../../context';

import { TransformTable } from '../table';
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
import { buildFillsRows, paramsValidator as fillRowsParamsValidator } from './fillRows';
import { buildInsertRows, paramsValidator as insertRowsParamsValidator } from './insertRows';
import {
  buildGatherColumns,
  paramsValidator as gatherColumnsParamsValidator,
} from './gatherColumns';
import { buildFetchData, paramsValidator as fetchDataParamsValidator } from './fetchData';
import { buildOrderColumns, paramsValidator as orderColumnsParamsValidator } from './orderColumns';
import { buildSql, paramsValidator as sqlParamsValidator } from './sql';

type TransformBuilder = (
  params: unknown,
  context: Context,
) => (table: TransformTable) => TransformTable | Promise<TransformTable>;

export const transformBuilders: Record<string, TransformBuilder> = {
  fetchData: buildFetchData,
  insertColumns: buildInsertColumns,
  excludeColumns: buildExcludeColumns,
  updateColumns: buildUpdateColumns,
  mergeRows: buildMergeRows,
  sortRows: buildSortRows,
  excludeRows: buildExcludeRows,
  fillRows: buildFillsRows,
  insertRows: buildInsertRows,
  gatherColumns: buildGatherColumns,
  orderColumns: buildOrderColumns,
  sql: buildSql,
};

export const transformSchemas: Record<string, yup.AnyObjectSchema> = {
  fetchData: fetchDataParamsValidator,
  insertColumns: insertColumnsParamsValidator,
  excludeColumns: excludeColumnsParamsValidator,
  updateColumns: updateColumnsParamsValidator,
  mergeRows: mergeRowsParamsValidator,
  sortRows: sortRowsParamsValidator,
  excludeRows: excludeRowsParamsValidator,
  fillRows: fillRowsParamsValidator,
  insertRows: insertRowsParamsValidator,
  gatherColumns: gatherColumnsParamsValidator,
  orderColumns: orderColumnsParamsValidator,
  sql: sqlParamsValidator,
};
