import { NextFunction, Request, Response } from 'express';
import { PermissionsError } from '@tupaia/utils';
import { CommonContext } from '../types';
import { extractEntityFieldsFromQuery, extractEntityFieldFromQuery } from './fields';

const throwNoAccessError = (hierarchyName: string) => {
  throw new PermissionsError(`No access to requested hierarchy: ${hierarchyName}`);
};

export const attachCommonEntityContext = async (
  req: Request<{ hierarchyName: string }, any, any, { field?: string; fields?: string }> & {
    ctx: CommonContext;
  },
  res: Response,
  next: NextFunction,
) => {
  try {
    const { hierarchyName } = req.params;

    const hierarchy = await req.models.entityHierarchy.findOne({ name: hierarchyName });
    if (!hierarchy) {
      throwNoAccessError(hierarchyName);
    }

    req.ctx.hierarchyId = hierarchy.id;

    const { fields, field } = req.query;
    req.ctx.fields = extractEntityFieldsFromQuery(fields);
    req.ctx.field = extractEntityFieldFromQuery(field);

    next();
  } catch (error) {
    next(error);
  }
};
