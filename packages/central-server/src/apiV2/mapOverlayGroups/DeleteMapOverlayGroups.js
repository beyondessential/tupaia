import { DeleteHandler } from '../DeleteHandler';
import { assertBESAdminAccess } from '../../permissions';

export class DeleteMapOverlayGroups extends DeleteHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }
}
