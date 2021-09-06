/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildUpdateColumns } from './updateColumns';
import { buildGroupRows } from './groupRows';
import { buildSort } from './sort';
import { buildExcludeRows } from './excludeRows';
import { buildInsert } from './insert';

export const transformBuilders = {
  updateColumns: buildUpdateColumns,
  groupRows: buildGroupRows,
  sort: buildSort,
  excludeRows: buildExcludeRows,
  insert: buildInsert,
};
