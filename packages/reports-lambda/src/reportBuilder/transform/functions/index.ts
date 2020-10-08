import { buildSelect } from './select';
import { buildAggregate } from './aggregate';
import { buildSort } from './sort';
import { buildFilter } from './filter';

export const transformBuilders = {
  select: buildSelect,
  aggregate: buildAggregate,
  sort: buildSort,
  filter: buildFilter,
};
