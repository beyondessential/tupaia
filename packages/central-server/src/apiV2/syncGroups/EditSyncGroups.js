import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertSyncGroupEditPermissions } from './assertSyncGroupPermissions';

export class EditSyncGroups extends EditHandler {
  async assertUserHasAccess() {
    const syncGroupChecker = accessPolicy =>
      assertSyncGroupEditPermissions(accessPolicy, this.models, this.recordId);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, syncGroupChecker]));
  }

  async editRecord() {
    await this.updateRecord();
  }
}
