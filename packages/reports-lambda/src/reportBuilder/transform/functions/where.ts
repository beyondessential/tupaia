import { FieldValue, Row } from '../../reportBuilder';
import { functions, functionBuilders } from '../../functions';

export type WhereClaus = {
  check: (row: Row) => FieldValue;
};

export type WhereParams = {
  where?: WhereClaus;
};

export const where = (row: Row, params: WhereParams): boolean => {
  if (params.where === undefined) {
    return true;
  }

  const whereResult = params.where.check(row);
  if (typeof whereResult === 'boolean') {
    return whereResult;
  }
  throw new Error(`Expected truthy result but got ${whereResult}`);
};

export const buildWhereParams = (params: unknown): WhereParams => {
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

  const whereFunction = whereFunctionList[0][0] as keyof typeof functions;
  const whereParams = whereFunctionList[0][1] as unknown;
  if (!(whereFunction in functions)) {
    throw new Error(
      `Expected a transform to be one of ${Object.keys(functions)} but got ${whereFunction}`,
    );
  }

  return {
    where: {
      check: functionBuilders[whereFunction](whereParams),
    },
  };
};

export const buildWhere = (params: unknown) => {
  const builtParams = buildWhereParams(params);
  return (row: Row) => where(row, builtParams);
};
