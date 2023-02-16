/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { NextFunction, Request, Response } from 'express';
import { getAjv } from '@tupaia/tsutils';
import { generateId } from '@tupaia/database';
import { DataTablePreviewRequestSchema } from '@tupaia/types';
import type { DataTablePreviewRequest } from '@tupaia/types';

import { getDataTableService } from '../dataTableService';
import { validatePermissions } from './helpers';

const validateDataTableFields = (dataTableFields: any): DataTablePreviewRequest => {
  const ajv = getAjv();
  const dataTableValidator = ajv.compile(DataTablePreviewRequestSchema);
  // Add random id to meet validation requirement
  const validate = dataTableValidator({ id: generateId(), ...dataTableFields });
  if (!validate && dataTableValidator.errors) {
    throw new Error(dataTableValidator.errors[0].message);
  }

  return dataTableFields;
};

/**
 * Finds the requested dataTable and attaches it to the context
 * Checks for permissions
 */
export const attachDataTableFromPreviewToContext = async (
  req: Request<any, any, any, any>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { models, body } = req;
    const dataTableFields = validateDataTableFields(body);
    const dataTable = await models.dataTable.generateInstance(dataTableFields);

    validatePermissions(dataTable, req);

    const dataTableService = getDataTableService(dataTable, req);

    req.ctx.dataTable = dataTable;
    req.ctx.dataTableService = dataTableService;

    next();
  } catch (error) {
    next(error);
  }
};
