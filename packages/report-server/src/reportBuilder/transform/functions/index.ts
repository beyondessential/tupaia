/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildSelect } from './select';
import { buildAggregate } from './aggregate';
import { buildSort } from './sort';
import { buildFilter } from './filter';
import { buildInsert } from './insert';

export const transformBuilders = {
  select: buildSelect,
  aggregate: buildAggregate,
  sort: buildSort,
  filter: buildFilter,
  insert: buildInsert,
};
