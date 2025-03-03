import { NextFunction, Request, Response } from 'express';
import { getDataTableService } from '../dataTableService';
import { validatePermissions } from './helpers';

/**
 * Finds the requested dataTable and attaches it to the context
 * Checks for permissions
 */
export const attachDataTableToContext = async (
  req: Request<{ dataTableCode: string }, any, any, any>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { models, params } = req;
    const { dataTableCode } = params;
    const dataTable = await models.dataTable.findOne({ code: dataTableCode });
    if (!dataTable) {
      throw new Error(`No data-table found with code ${dataTableCode}`);
    }

    validatePermissions(dataTable, req);

    const dataTableService = getDataTableService(dataTable, req);

    req.ctx.dataTable = dataTable;
    req.ctx.dataTableService = dataTableService;

    next();
  } catch (error) {
    next(error);
  }
};
