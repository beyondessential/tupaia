import { TransformParser } from '../parser';

type WhereParams = {
  where?: string;
};

const where = (parser: TransformParser, params: WhereParams): boolean => {
  if (params.where === undefined) {
    return true;
  }

  const whereResult = parser.evaluate(params.where);
  if (typeof whereResult === 'boolean') {
    return whereResult;
  }
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
  return (parser: TransformParser) => where(parser, builtParams);
};
