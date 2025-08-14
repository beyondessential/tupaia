import { Context } from '../../context';
import { TransformTable } from '../table';
import {
  buildExcludeColumns,
  paramsValidator as excludeColumnsParamsValidator,
} from './excludeColumns';
import { buildExcludeRows, paramsValidator as excludeRowsParamsValidator } from './excludeRows';
import { buildFetchData, paramsValidator as fetchDataParamsValidator } from './fetchData';
import { buildFillsRows, paramsValidator as fillRowsParamsValidator } from './fillRows';
import {
  buildGatherColumns,
  paramsValidator as gatherColumnsParamsValidator,
} from './gatherColumns';
import {
  buildInsertColumns,
  paramsValidator as insertColumnsParamsValidator,
} from './insertColumns';
import { buildInsertRows, paramsValidator as insertRowsParamsValidator } from './insertRows';
import { buildMergeRows, paramsValidator as mergeRowsParamsValidator } from './mergeRows';
import { buildOrderColumns, paramsValidator as orderColumnsParamsValidator } from './orderColumns';
import { buildSortRows, paramsValidator as sortRowsParamsValidator } from './sortRows';
import { buildSql, paramsValidator as sqlParamsValidator } from './sql';
import {
  buildUpdateColumns,
  paramsValidator as updateColumnsParamsValidator,
} from './updateColumns';

export type TransformName =
  | 'fetchData'
  | 'insertColumns'
  | 'excludeColumns'
  | 'updateColumns'
  | 'mergeRows'
  | 'sortRows'
  | 'excludeRows'
  | 'fillRows'
  | 'insertRows'
  | 'gatherColumns'
  | 'orderColumns'
  | 'sql';

export interface TransformStep {
  (table: TransformTable): TransformTable | Promise<TransformTable>;
}

export interface TransformBuilder {
  (params: unknown, context: Context): TransformStep;
}

export const transformBuilders: Record<TransformName, TransformBuilder> = {
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

export const transformSchemas = {
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
} as const;
