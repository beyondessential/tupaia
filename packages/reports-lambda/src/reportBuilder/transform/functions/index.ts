import { select, buildSelect } from './select';
import { drop, buildDrop } from './drop';
import { mergeRows, buildMergeRows } from './mergeRows';
import { sort, buildSort } from './sort';
import { filter, buildFilter } from './filter';

export const transformFunctions = {
  select,
  drop,
  mergeRows,
  sort,
  filter,
};

export const transformFunctionBuilders = {
  select: buildSelect,
  drop: buildDrop,
  mergeRows: buildMergeRows,
  sort: buildSort,
  filter: buildFilter,
};
