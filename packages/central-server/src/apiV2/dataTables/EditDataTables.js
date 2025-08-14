import { ensure } from '@tupaia/tsutils';
import { DataTableType } from '@tupaia/types';
import { PermissionsError } from '@tupaia/utils';
import {
  assertAllPermissions,
  assertAnyPermissions,
  assertBESAdminAccess,
  assertVizBuilderAccess,
} from '../../permissions';
import { EditHandler } from '../EditHandler';
import { hasExternalDatabaseConnectionPermissions } from '../externalDatabaseConnections';

async function hasDataTableWritePermissions(accessPolicy, models, dataTableId) {
  const dataTable = ensure(
    await models.dataTable.findById(dataTableId),
    `No data table exists with ID ${dataTableId}`,
  );

  /**
   * Editing non-SQL data tables require BES Admin
   * @see EditDataTables#assertUserHasAccess
   */
  if (dataTable.type !== DataTableType.sql) return false;

  // Editing SQL data tables require access to its external database connection
  const dbConnection = await dataTable.getExternalDatabaseConnection();

  // This data table got created with no external database connection. Allow only BES Admin.
  if (!dbConnection) return false;

  return await hasExternalDatabaseConnectionPermissions(accessPolicy, models, dbConnection.id);
}

const assertDataTableEditPermissions = async (accessPolicy, models, dataTableId) => {
  const authorized = await hasDataTableWritePermissions(accessPolicy, models, dataTableId);
  if (!authorized) {
    throw new PermissionsError('Need edit permissions to this data table');
  }
  return true;
};
export class EditDataTables extends EditHandler {
  async assertUserHasAccess() {
    const dataTablePermissionChecker = accessPolicy =>
      assertDataTableEditPermissions(accessPolicy, this.models, this.recordId);

    await this.assertPermissions(
      assertAnyPermissions([
        assertBESAdminAccess,
        assertAllPermissions([assertVizBuilderAccess, dataTablePermissionChecker]),
      ]),
    );
  }

  async editRecord() {
    await this.updateRecord();
  }
}
