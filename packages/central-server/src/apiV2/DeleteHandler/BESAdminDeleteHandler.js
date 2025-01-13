import { DeleteHandler } from './DeleteHandler';
import { assertBESAdminAccess } from '../../permissions';

export class BESAdminDeleteHandler extends DeleteHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }
}
