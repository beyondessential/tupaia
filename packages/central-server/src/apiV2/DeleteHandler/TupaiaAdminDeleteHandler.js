import { DeleteHandler } from './DeleteHandler';
import { assertAdminPanelAccess } from '../../permissions';

export class TupaiaAdminDeleteHandler extends DeleteHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertAdminPanelAccess);
  }
}
