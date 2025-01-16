import { NextFunction, Request, Response } from 'express';
import { ajvValidate } from '@tupaia/tsutils';
import { DataTablePreviewRequestSchema } from '@tupaia/types';
import type { DataTablePreviewRequest } from '@tupaia/types';

import { getDataTableService } from '../dataTableService';
import { validatePermissions } from './helpers';

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
    const dataTableFields = ajvValidate<DataTablePreviewRequest>(
      DataTablePreviewRequestSchema,
      body,
    );
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
