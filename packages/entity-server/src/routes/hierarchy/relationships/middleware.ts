import { NextFunction, Response } from 'express';

import { Writable } from '@tupaia/types';
import { extractEntityFilterFromQuery } from '@tupaia/tsmodels';

import { extractEntityFieldFromQuery } from '../middleware/fields';
import {
  RelationshipsRequest,
  MultiEntityRelationshipsRequest,
  RelationshipsQuery,
  RelationshipsSubQuery,
  Prefix,
} from './types';

type Strip<T extends string, U extends string> = T extends `${U}_${infer P}` ? P : T;
const strip = <T extends string, U extends string>(baseString: T, toStrip: U) => {
  const stripped = baseString.startsWith(`${toStrip}_`)
    ? baseString.split(`${toStrip}_`)[1]
    : baseString;
  return stripped as Strip<T, U>;
};

const getSubQuery = (
  query: RelationshipsQuery,
  from: 'ancestor' | 'descendant',
): RelationshipsSubQuery => {
  const strippedQuery: Writable<RelationshipsSubQuery> = {};
  Object.entries(query).forEach(([key, value]) => {
    if (key.startsWith(`${from}_`)) {
      const strippedKey = strip(
        key as keyof Prefix<RelationshipsSubQuery, 'ancestor' | 'descendant'>,
        from,
      );
      strippedQuery[strippedKey] = value;
    }
  });
  return strippedQuery;
};

const getSubContext = (
  req: RelationshipsRequest | MultiEntityRelationshipsRequest,
  from: 'ancestor' | 'descendant',
) => {
  const { field: baseField, allowedCountries } = req.ctx;
  const { field: queryField, filter: queryFilter } = getSubQuery(req.query, from);
  const field = (queryField ? extractEntityFieldFromQuery(queryField) : baseField) || 'code';
  const filter = extractEntityFilterFromQuery(allowedCountries, queryFilter);
  const { type, ...restOfFilter } = filter;
  if (typeof type !== 'string' && typeof type !== 'undefined') {
    throw new Error(
      `${from}_filter:type must be a basic equality, single, not null type constraint`,
    );
  }
  return { type, field, filter: restOfFilter };
};

export const attachRelationshipsContext = async (
  req: RelationshipsRequest | MultiEntityRelationshipsRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    req.ctx.ancestor = getSubContext(req, 'ancestor');

    const { type, ...restOfDescendantSubContext } = getSubContext(req, 'descendant');
    if (type === undefined) {
      throw new Error('descendant_filter:type url parameter must be present');
    }
    req.ctx.descendant = { ...restOfDescendantSubContext, type };

    next();
  } catch (error) {
    next(error);
  }
};
