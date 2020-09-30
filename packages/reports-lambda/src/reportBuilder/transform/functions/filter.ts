import { buildWhere } from './where';
import { Row } from '../../reportBuilder';

export type FilterParams = {
  where: (row: Row) => boolean;
};

export const filter = (rows: Row[], params: FilterParams): Row[] => {
  return rows.filter(row => params.where(row));
};

export const buildFilterParams = (params: unknown): FilterParams => {
  return { where: buildWhere(params) };
};

export const buildFilter = (params: unknown) => {
  const builtParams = buildFilterParams(params);
  return (rows: Row[]) => filter(rows, builtParams);
};
