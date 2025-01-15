import { EditHandler } from '../EditHandler';
import {
  assertAllPermissions,
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
} from '../../permissions';
import { assertDataGroupEditPermissions } from './assertDataGroupPermissions';

export class EditDataGroups extends EditHandler {
  async assertUserHasAccess() {
    // User has access to all child data_elements of the data_group, plus tupaia admin panel
    // Or is a BES admin
    const dataGroupPermissionChecker = accessPolicy =>
      assertDataGroupEditPermissions(accessPolicy, this.models, this.recordId);

    await this.assertPermissions(
      assertAnyPermissions([
        assertBESAdminAccess,
        assertAllPermissions([assertAdminPanelAccess, dataGroupPermissionChecker]),
      ]),
    );
  }

  async editRecord() {
    return this.updateRecord();
  }
}
