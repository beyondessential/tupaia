/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { NextFunction, Response } from 'express';
import { PermissionsError } from '@tupaia/utils';
import { SingleEntityRequest, MultiEntityRequest } from '../types';
import { extractFieldsFromQuery, extractFieldFromQuery } from './fields';

const throwNoAccessError = (hierarchyName: string) => {
  throw new PermissionsError(`No access to requested hierarchy: ${hierarchyName}`);
};

export const attachCommonContext = async (
  req: SingleEntityRequest | MultiEntityRequest,
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
    req.ctx.fields = extractFieldsFromQuery(fields);
    req.ctx.field = extractFieldFromQuery(field);

    next();
  } catch (error) {
    next(error);
  }
};
