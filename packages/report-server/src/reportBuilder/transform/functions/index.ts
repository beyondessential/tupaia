/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';
import { Context } from '../../context';

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
import {
  buildGatherColumns,
  paramsValidator as gatherColumnsParamsValidator,
} from './gatherColumns';
import { buildFetchData, paramsValidator as fetchDataParamsValidator } from './fetchData';
import { buildOrderColumns, paramsValidator as orderColumnsParamsValidator } from './orderColumns';
import { TransformTable } from '../table';

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
  insertRows: buildInsertRows,
  gatherColumns: buildGatherColumns,
  orderColumns: buildOrderColumns,
};

export const transformSchemas: Record<string, yup.AnyObjectSchema> = {
  fetchData: fetchDataParamsValidator,
  insertColumns: insertColumnsParamsValidator,
  excludeColumns: excludeColumnsParamsValidator,
  updateColumns: updateColumnsParamsValidator,
  mergeRows: mergeRowsParamsValidator,
  sortRows: sortRowsParamsValidator,
  excludeRows: excludeRowsParamsValidator,
  insertRows: insertRowsParamsValidator,
  gatherColumns: gatherColumnsParamsValidator,
  orderColumns: orderColumnsParamsValidator,
};
