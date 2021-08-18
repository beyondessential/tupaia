/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TransformParser } from '../parser';
import { functions } from '../../functions';
import { buildWhere } from './where';
import { Row } from '../../types';

type SelectParams = {
  select: { [key: string]: string };
  '...'?: '*' | string[];
  where: (parser: TransformParser) => boolean;
};

const select = (rows: Row[], params: SelectParams): Row[] => {
  const parser = new TransformParser(rows, functions);
  return rows.map(row => {
    const returnNewRow = params.where(parser);
    if (!returnNewRow) {
      parser.next();
      return row;
    }
    const newRow: Row = {};
    Object.entries(params.select).forEach(([key, expression]) => {
      newRow[`${parser.evaluate(key)}`] = parser.evaluate(expression);
    });

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

    parser.next();
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
