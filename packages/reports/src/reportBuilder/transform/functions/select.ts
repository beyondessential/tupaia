import { functions, parseExpression } from '../../functions';
import { buildWhere } from './where';
import { FieldValue, Row } from '../../reportBuilder';
import { Parser, parser } from 'mathjs';

type SelectParams = {
  select: { [key: string]: string };
  '...'?: '*' | string[];
  where: (row: Row, rowParser: Parser) => boolean;
};

type Context = {
  row: Row;
  all: { [key: string]: FieldValue[] };
  allPrevious: { [key: string]: FieldValue[] };
  where: (check: (row: Row) => boolean) => { [key: string]: FieldValue[] };
};

const select = (rows: Row[], params: SelectParams): Row[] => {
  const rowParser = parser();
  Object.entries(functions).forEach(([name, call]) => rowParser.set(name, call));

  const whereFunction = (check: (row: Row) => boolean) => {
    const whereData = {} as { [key: string]: FieldValue[] };
    const filteredRows = rows.filter(rowInFilter => check(rowInFilter));
    filteredRows.forEach(row => {
      Object.entries(row).forEach(([field, value]) => {
        if (!(field in whereData)) {
          whereData[field] = [];
        }
        whereData[field].push(value);
      });
    });
    return whereData;
  };
  const context = { row: {}, all: {}, allPrevious: {}, where: whereFunction } as Context;
  rows.forEach(row => {
    Object.entries(row).forEach(([field, value]) => {
      if (!(field in context.all)) {
        context.all[field] = [];
      }
      context.all[field].push(value);
    });
  });
  rowParser.set('$', context);

  return rows.map(row => {
    context.row = row;
    Object.entries(row).forEach(([field, value]) => {
      if (!(field in context.allPrevious)) {
        context.allPrevious[field] = [];
      }
      context.allPrevious[field].push(value);
    });

    const returnNewRow = params.where(row, rowParser);
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
    return returnNewRow ? newRow : { ...row };
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
