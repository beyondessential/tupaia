/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { NextFunction, Request, Response } from 'express';
import { HierarchyContext } from '../types';
import { extractHierarchyFieldsFromQuery, extractHierarchyFieldFromQuery } from './fields';

export const attachHierarchyContext = async (
  req: Request<Record<string, never>, any, any, { field?: string; fields?: string }> & {
    ctx: HierarchyContext;
  },
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fields, field } = req.query;
    req.ctx.fields = extractHierarchyFieldsFromQuery(fields);
    req.ctx.field = extractHierarchyFieldFromQuery(field);

    next();
  } catch (error) {
    next(error);
  }
};
