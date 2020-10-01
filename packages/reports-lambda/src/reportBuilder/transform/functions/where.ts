import { FieldValue, Row } from '../../reportBuilder';
import { functionBuilders } from '../../functions';

type WhereClaus = {
  check: (row: Row) => FieldValue;
};

type WhereParams = {
  where?: WhereClaus;
};

const where = (row: Row, params: WhereParams): boolean => {
  if (params.where === undefined) {
    return true;
  }

  const whereResult = params.where.check(row);
  if (typeof whereResult === 'boolean') {
    return whereResult;
  }
  throw new Error(`Expected truthy result but got ${whereResult}`);
};

const buildParams = (params: unknown): WhereParams => {
  if (typeof params !== 'object' || params === null) {
    throw new Error(`Expected params object but got ${params}`);
  }

  if (!('where' in params)) {
    return {};
  }

  const whereClaus: unknown = params.where;

  if (typeof whereClaus !== 'object' || whereClaus === null) {
    throw new Error(`Expected params object but got ${params}`);
  }

  const whereFunctionList = Object.entries(whereClaus) as [string, unknown];
  if (whereFunctionList.length < 1 || whereFunctionList.length > 1) {
    throw new Error(`Expected a single transform defined but got ${whereFunctionList.length}`);
  }

  const where = whereFunctionList[0][0] as keyof typeof functionBuilders;
  const whereParams = whereFunctionList[0][1] as unknown;
  if (!(where in functionBuilders)) {
    throw new Error(
      `Expected a transform to be one of ${Object.keys(functionBuilders)} but got ${where}`,
    );
  }

  return {
    where: {
      check: functionBuilders[where](whereParams),
    },
  };
};

export const buildWhere = (params: unknown) => {
  const builtParams = buildParams(params);
  return (row: Row) => where(row, builtParams);
};
