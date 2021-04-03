/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { NextFunction, Response } from 'express';
import { Writable } from '../../../types';
import { HierarchyRequestQuery } from '../types';
import { extractFieldsFromQuery, extractFlatFromQuery } from '../middleware/fields';
import { extractFilterFromQuery } from '../middleware/filter';
import { RelationsRequest, RelationsQuery, Prefix } from './types';

type Strip<T extends string, U extends string> = T extends `${U}_${infer P}` ? P : T;
const strip = <T extends string, U extends string>(baseString: T, toStrip: U) => {
  const stripped = baseString.startsWith(`${toStrip}_`)
    ? baseString.split(`${toStrip}_`)[1]
    : baseString;
  return stripped as Strip<T, U>;
};

const getSubQuery = (
  query: RelationsQuery,
  from: 'ancestor' | 'descendant',
): HierarchyRequestQuery => {
  const strippedQuery: Writable<HierarchyRequestQuery> = {};
  Object.entries(query).forEach(([key, value]) => {
    if (key.startsWith(`${from}_`)) {
      const strippedKey = strip(
        key as keyof Prefix<HierarchyRequestQuery, 'ancestor' | 'descendant'>,
        from,
      );
      strippedQuery[strippedKey] = value;
    }
  });
  return strippedQuery as HierarchyRequestQuery;
};

const getSubContext = (req: RelationsRequest, from: 'ancestor' | 'descendant') => {
  const { fields: baseFields, flat: baseFlat } = req.ctx;
  const { field: queryField, fields: queryFields, ...restOfQuery } = getSubQuery(req.query, from);
  const flat = queryField ? extractFlatFromQuery(queryField) : baseFlat;
  const fields = queryFields ? extractFieldsFromQuery(queryFields) : baseFields;
  const filter = extractFilterFromQuery(restOfQuery);
  const { type, ...restOfFilter } = filter;
  if (!type || Array.isArray(type)) {
    throw new Error(`Must provide single ${from}_type url parameter`);
  }
  return { type, flat, fields, filter: restOfFilter };
};

export const attachRelationsContext = async (
  req: RelationsRequest,
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
