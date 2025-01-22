import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertMapOverlayGroupRelationsEditPermissions } from './assertMapOverlayGroupRelationsPermissions';

export class DeleteMapOverlayGroupRelations extends DeleteHandler {
  async assertUserHasAccess() {
    const mapOverlayChecker = accessPolicy =>
      assertMapOverlayGroupRelationsEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, mapOverlayChecker]));
  }
}
