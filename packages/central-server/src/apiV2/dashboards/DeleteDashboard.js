import { DeleteHandler } from '../DeleteHandler';
import { assertBESAdminAccess } from '../../permissions';

export class DeleteDashboard extends DeleteHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }
}
