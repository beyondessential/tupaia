/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildInsertColumns } from './insertColumns';
import { buildExcludeColumns } from './excludeColumns';
import { buildUpdateColumns } from './updateColumns';
import { buildMergeRows } from './mergeRows';
import { buildSortRows } from './sortRows';
import { buildExcludeRows } from './excludeRows';
import { buildInsertRows } from './insertRows';

export const transformBuilders = {
  insertColumns: buildInsertColumns,
  excludeColumns: buildExcludeColumns,
  updateColumns: buildUpdateColumns,
  mergeRows: buildMergeRows,
  sortRows: buildSortRows,
  excludeRows: buildExcludeRows,
  insertRows: buildInsertRows,
};
