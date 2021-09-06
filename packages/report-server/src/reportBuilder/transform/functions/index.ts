/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildUpdateColumns } from './updateColumns';
import { buildGroupRows } from './groupRows';
import { buildSort } from './sort';
import { buildFilter } from './filter';
import { buildInsert } from './insert';

export const transformBuilders = {
  updateColumns: buildUpdateColumns,
  groupRows: buildGroupRows,
  sort: buildSort,
  filter: buildFilter,
  insert: buildInsert,
};
