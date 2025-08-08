import { GETHandler } from '../GETHandler';
import { assertAdminPanelAccess } from '../../permissions';
import { createSyncGroupDBFilter } from './assertSyncGroupPermissions';

export class GETSyncGroups extends GETHandler {
  permissionsFilteredInternally = true;

  async assertUserHasAccess() {
    await this.assertPermissions(assertAdminPanelAccess);
  }

  async getPermissionsFilter(criteria, options) {
    return createSyncGroupDBFilter(this.accessPolicy, this.models, criteria, options);
  }
}
