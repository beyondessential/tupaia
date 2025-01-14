import { GETHandler } from '../GETHandler';
import { assertAdminPanelAccess } from '../../permissions';

export class GETOptionSets extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertAdminPanelAccess);
  }
}
