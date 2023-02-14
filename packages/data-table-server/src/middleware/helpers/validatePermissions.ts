/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { DataTableType } from '../../models';

export const validatePermissions = (dataTable: DataTableType, req: Request<any, any, any, any>) => {
  const { code: dataTableCode, permission_groups: permissionGroups } = dataTable;

  if (
    !(
      permissionGroups.includes('*') ||
      permissionGroups.some((permissionGroup: string) =>
        req.accessPolicy.allowsAnywhere(permissionGroup),
      )
    )
  ) {
    throw new Error(`User does not have permission to access data table ${dataTableCode}`);
  }
};
