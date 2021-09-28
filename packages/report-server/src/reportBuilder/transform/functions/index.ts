/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Context } from '../../context';
import { Row } from '../../types';

import { buildInsertColumns } from './insertColumns';
import { buildExcludeColumns } from './excludeColumns';
import { buildUpdateColumns } from './updateColumns';
import { buildMergeRows } from './mergeRows';
import { buildSortRows } from './sortRows';
import { buildExcludeRows } from './excludeRows';
import { buildInsertRows } from './insertRows';

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
