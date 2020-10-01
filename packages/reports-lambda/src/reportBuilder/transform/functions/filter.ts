import { buildWhere } from './where';
import { Row } from '../../reportBuilder';

type FilterParams = {
  where: (row: Row) => boolean;
};

const filter = (rows: Row[], params: FilterParams): Row[] => {
  return rows.filter(row => params.where(row));
};

const buildParams = (params: unknown): FilterParams => {
  return { where: buildWhere(params) };
};

export const buildFilter = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => filter(rows, builtParams);
};
