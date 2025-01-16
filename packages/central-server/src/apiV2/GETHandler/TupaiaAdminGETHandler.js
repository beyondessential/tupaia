import { GETHandler } from './GETHandler';
import { assertAdminPanelAccess } from '../../permissions';

export class TupaiaAdminGETHandler extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertAdminPanelAccess);
  }
}
