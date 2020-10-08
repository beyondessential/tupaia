import { Row } from '../../reportBuilder';
import { functions, parseExpression } from '../../functions';
import { parser } from 'mathjs';

type WhereParams = {
  where?: string;
};

const where = (row: Row, params: WhereParams): boolean => {
  if (params.where === undefined) {
    return true;
  }

  const rowParser = parser();
  rowParser.set('$', row);
  Object.entries(functions).forEach(([name, call]) => rowParser.set(name, call));
  const whereResult = parseExpression(rowParser, params.where);
  if (typeof whereResult === 'boolean') {
    return whereResult;
  }
  console.log(`Expected truthy result but got ${whereResult}`);
  return true;
};

const buildParams = (params: unknown): WhereParams => {
  if (typeof params !== 'object' || params === null) {
    throw new Error(`Expected params object but got ${params}`);
  }

  if (!('where' in params)) {
    return {};
  }

  const whereClaus: unknown = params.where;

  if (typeof whereClaus !== 'string') {
    throw new Error(`Expected string but got ${params}`);
  }

  return {
    where: whereClaus,
  };
};

export const buildWhere = (params: unknown) => {
  const builtParams = buildParams(params);
  return (row: Row) => where(row, builtParams);
};
