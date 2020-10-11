import { functions } from '../../functions';
import { buildWhere } from './where';
import { Row } from '../../reportBuilder';
import { parser, Parser } from 'mathjs';

type FilterParams = {
  where: (row: Row, rowParser: Parser) => boolean;
};

const filter = (rows: Row[], params: FilterParams): Row[] => {
  const rowParser = parser();
  Object.entries(functions).forEach(([name, call]) => rowParser.set(name, call));
  const context = {} as { row: Row };
  rowParser.set('$', context);
  return rows.filter(row => {
    context.row = row;
    return params.where(row, rowParser);
  });
};

const buildParams = (params: unknown): FilterParams => {
  return { where: buildWhere(params) };
};

export const buildFilter = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => filter(rows, builtParams);
};
