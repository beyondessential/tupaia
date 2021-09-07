/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildInsertColumns } from './insertColumns';
import { buildExcludeColumns } from './excludeColumns';
import { buildUpdateColumns } from './updateColumns';
import { buildGroupRows } from './groupRows';
import { buildSortRows } from './sortRows';
import { buildExcludeRows } from './excludeRows';
import { buildInsertRows } from './insertRows';

export const transformBuilders = {
  insertColumns: buildInsertColumns,
  excludeColumns: buildExcludeColumns,
  updateColumns: buildUpdateColumns,
  groupRows: buildGroupRows,
  sortRows: buildSortRows,
  excludeRows: buildExcludeRows,
  insertRows: buildInsertRows,
};
