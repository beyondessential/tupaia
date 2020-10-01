import { buildSelect } from './select';
import { buildDrop } from './drop';
import { buildMergeRows } from './mergeRows';
import { buildSort } from './sort';
import { buildFilter } from './filter';

export const transformBuilders = {
  select: buildSelect,
  drop: buildDrop,
  mergeRows: buildMergeRows,
  sort: buildSort,
  filter: buildFilter,
};
