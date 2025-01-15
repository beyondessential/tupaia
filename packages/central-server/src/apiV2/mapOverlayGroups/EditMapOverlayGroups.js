import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertMapOverlayGroupsEditPermissions } from './assertMapOverlayGroupsPermissions';

export class EditMapOverlayGroups extends EditHandler {
  async assertUserHasAccess() {
    const mapOverlayGroupChecker = accessPolicy =>
      assertMapOverlayGroupsEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, mapOverlayGroupChecker]),
    );
  }

  async editRecord() {
    await this.updateRecord();
  }
}
