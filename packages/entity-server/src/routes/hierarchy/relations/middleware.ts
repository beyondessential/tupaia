/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { NextFunction, Response } from 'express';
import { Writable } from '../../../types';
import { extractFieldFromQuery } from '../middleware/fields';
import { extractFilterFromQuery } from '../middleware/filter';
import {
  RelationsRequest,
  MultiEntityRelationsRequest,
  RelationsQuery,
  RelationsSubQuery,
  Prefix,
} from './types';

type Strip<T extends string, U extends string> = T extends `${U}_${infer P}` ? P : T;
const strip = <T extends string, U extends string>(baseString: T, toStrip: U) => {
  const stripped = baseString.startsWith(`${toStrip}_`)
    ? baseString.split(`${toStrip}_`)[1]
    : baseString;
  return stripped as Strip<T, U>;
};

const getSubQuery = (query: RelationsQuery, from: 'ancestor' | 'descendant'): RelationsSubQuery => {
  const strippedQuery: Writable<RelationsSubQuery> = {};
  Object.entries(query).forEach(([key, value]) => {
    if (key.startsWith(`${from}_`)) {
      const strippedKey = strip(
        key as keyof Prefix<RelationsSubQuery, 'ancestor' | 'descendant'>,
        from,
      );
      strippedQuery[strippedKey] = value;
    }
  });
  return strippedQuery;
};

const getSubContext = (
  req: RelationsRequest | MultiEntityRelationsRequest,
  from: 'ancestor' | 'descendant',
) => {
  const { field: baseField, allowedCountries } = req.ctx;
  const { field: queryField, filter: queryFilter } = getSubQuery(req.query, from);
  const field = (queryField ? extractFieldFromQuery(queryField) : baseField) || 'code';
  const filter = extractFilterFromQuery(allowedCountries, queryFilter);
  const { type, ...restOfFilter } = filter;
  if (!type || Array.isArray(type)) {
    throw new Error(`${from}_filter must contain a single type constraint`);
  }
  return { type, field, filter: restOfFilter };
};

export const attachRelationsContext = async (
  req: RelationsRequest | MultiEntityRelationsRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    req.ctx.ancestor = getSubContext(req, 'ancestor');
    req.ctx.descendant = getSubContext(req, 'descendant');
    next();
  } catch (error) {
    next(error);
  }
};
