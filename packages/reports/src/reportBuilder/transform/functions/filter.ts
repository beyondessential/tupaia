import { ReportParser } from '../../parser';
import { functions } from '../../functions';
import { buildWhere } from './where';
import { Row } from '../../types';

type FilterParams = {
  where: (parser: ReportParser) => boolean;
};

const filter = (rows: Row[], params: FilterParams): Row[] => {
  const parser = new ReportParser(rows, functions);
  return rows.filter(() => {
    const filterResult = params.where(parser);
    parser.next();
    return filterResult;
  });
};

const buildParams = (params: unknown): FilterParams => {
  return { where: buildWhere(params) };
};

export const buildFilter = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => filter(rows, builtParams);
};
