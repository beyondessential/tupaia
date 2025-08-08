import { DataTable } from '@tupaia/types';
import { Request } from 'express';

export const validatePermissions = (dataTable: DataTable, req: Request<any, any, any, any>) => {
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
