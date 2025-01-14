import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertMapOverlayGroupRelationsEditPermissions } from './assertMapOverlayGroupRelationsPermissions';

export class EditMapOverlayGroupRelations extends EditHandler {
  async assertUserHasAccess() {
    const mapOverlayChecker = accessPolicy =>
      assertMapOverlayGroupRelationsEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, mapOverlayChecker]));
  }

  async editRecord() {
    await this.updateRecord();
  }
}
