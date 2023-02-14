/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { NextFunction, Request, Response } from 'express';
import { getAjv } from '@tupaia/tsutils';
import { generateId } from '@tupaia/database';
import { DataTablePreviewRequestSchema } from '@tupaia/types';
import type { DataTablePreviewRequest } from '@tupaia/types';

import { DataTableServiceBuilder, getDataTableServiceType } from '../dataTableService';

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
    const { accessPolicy, models, ctx, body } = req;
    const dataTableFields = validateDataTableFields(body);

    const dataTable = await models.dataTable.generateInstance(dataTableFields);
    const { code: dataTableCode } = dataTable;
    const { permission_groups: permissionGroups } = dataTable;
    if (
      !(
        permissionGroups.includes('*') ||
        permissionGroups.some((permissionGroup: string) =>
          accessPolicy.allowsAnywhere(permissionGroup),
        )
      )
    ) {
      throw new Error(`User does not have permission to access data table ${dataTableCode}`);
    }

    const serviceType = getDataTableServiceType(dataTable);
    const dataTableService = new DataTableServiceBuilder()
      .setServiceType(serviceType)
      .setContext({ apiClient: ctx.services, accessPolicy, models })
      .setConfig(dataTable.config)
      .build();

    req.ctx.dataTable = dataTable;
    req.ctx.dataTableService = dataTableService;

    next();
  } catch (error) {
    next(error);
  }
};
