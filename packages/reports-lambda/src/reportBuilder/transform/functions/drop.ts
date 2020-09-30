import { Row } from '../../reportBuilder';
import { parseToken } from '../../functions';
import { buildWhere } from './where';

type WhereDropParams = { field: string; where: (row: Row) => boolean };
type BasicDropParams = string;
type DropParams = WhereDropParams | BasicDropParams;

export const drop = (rows: Row[], params: DropParams): Row[] => {
  return rows.map(row => {
    if (typeof params === 'string') {
      const parsedParams = parseToken(row, params);
      if (typeof parsedParams === 'string') {
        const { [parsedParams]: deletedColumn, ...restOfRow } = row;
        return restOfRow;
      } else {
        throw new Error(`Expected string for drop params, but got ${parsedParams}`);
      }
    } else {
      if (!params.where(row)) {
        return { ...row };
      }

      const parsedParams = parseToken(row, params.field);
      if (typeof parsedParams === 'string') {
        const { [parsedParams]: deletedColumn, ...restOfRow } = row;
        return restOfRow;
      } else {
        throw new Error(`Expected string for drop params, but got ${parsedParams}`);
      }
    }
  });
};

export const buildDropParams = (params: unknown): DropParams => {
  if (typeof params === 'string') {
    return params;
  } else if (typeof params === 'object' && params !== null) {
    const { field } = params;
    if (field === undefined || typeof field !== 'string') {
      throw new Error(`Expected 'field' property to be string but got ${field}`);
    }
    return {
      field,
      where: buildWhere(params),
    };
  }

  throw new Error(`Expected either string or object, but got ${params}`);
};

export const buildDrop = (params: unknown) => {
  const builtParams = buildDropParams(params);
  return (rows: Row[]) => drop(rows, builtParams);
};
