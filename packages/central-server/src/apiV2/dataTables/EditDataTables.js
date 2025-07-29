import { PermissionsError } from '@tupaia/utils';
import {
  assertAllPermissions,
  assertAnyPermissions,
  assertBESAdminAccess,
  assertVizBuilderAccess,
} from '../../permissions';
import { EditHandler } from '../EditHandler';
import { hasDataTablePermissions } from './assertDataTablePermissions';

const assertDataTableEditPermissions = async (accessPolicy, models, dataTableId) => {
  const authorized = await hasDataTablePermissions(accessPolicy, models, dataTableId);
  if (!authorized) {
    throw new PermissionsError('You don’t have permission to edit this data table');
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
