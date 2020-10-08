import { functions, parseExpression } from '../../functions';
import { buildWhere } from './where';
import { Row } from '../../reportBuilder';
import { parser } from 'mathjs';

type SelectParams = {
  select: { [key: string]: string };
  '...'?: '*' | string[];
  where: (row: Row) => boolean;
};

const select = (rows: Row[], params: SelectParams): Row[] => {
  return rows.map(row => {
    if (!params.where(row)) {
      return { ...row };
    }

    const rowParser = parser();
    rowParser.set('$', row);
    Object.entries(functions).forEach(([name, call]) => rowParser.set(name, call));
    // Object.entries(row).forEach(([field, value]) => rowParser.set(`$${field}`, value));
    const newRow: Row = {};
    Object.entries(params.select).forEach(
      ([key, expression]) =>
        (newRow[`${parseExpression(rowParser, key)}`] = parseExpression(rowParser, expression)),
    );

    if (params['...'] !== undefined) {
      Object.entries(row).forEach(([field, value]) => {
        if (field in newRow) {
          // Field already defined
          return;
        }

        if (params['...'] === '*' || params['...']?.includes(field)) {
          newRow[field] = value;
        }
      });
    }
    return newRow;
  });
};

const buildParams = (params: unknown): SelectParams => {
  if (typeof params !== 'object' || params === null) {
    throw new Error(`Expected params object but got ${params}`);
  }

  const { where, '...': spreadFields, ...restOfParams } = params;

  if (spreadFields !== undefined) {
    if (typeof spreadFields === 'string') {
      if (spreadFields !== '*') {
        throw new Error(`'...' must be either an array of strings or '*'`);
      }
    } else if (!Array.isArray(spreadFields)) {
      throw new Error(`'...' must be either an array of strings or '*'`);
    }
  }

  if (
    Object.entries(restOfParams).some(
      ([field, value]) => typeof field !== 'string' || typeof value !== 'string',
    )
  ) {
    throw new Error(`All other keys and values in select must be strings`);
  }

  return {
    select: restOfParams as { [key: string]: string },
    '...': spreadFields,
    where: buildWhere(params),
  };
};

export const buildSelect = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => select(rows, builtParams);
};
