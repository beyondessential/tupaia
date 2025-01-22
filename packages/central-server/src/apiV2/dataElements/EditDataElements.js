import { EditHandler } from '../EditHandler';
import {
  assertAllPermissions,
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
} from '../../permissions';
import { assertDataElementEditPermissions } from './assertDataElementPermissions';

export class EditDataElements extends EditHandler {
  async assertUserHasAccess() {
    // User has access to all permission groups for the data_element, plus tupaia admin panel
    // Or is a BES admin
    const dataElementPermissionChecker = accessPolicy =>
      assertDataElementEditPermissions(accessPolicy, this.models, this.recordId);

    await this.assertPermissions(
      assertAnyPermissions([
        assertBESAdminAccess,
        assertAllPermissions([assertAdminPanelAccess, dataElementPermissionChecker]),
      ]),
    );
  }

  async editRecord() {
    return this.updateRecord();
  }
}
