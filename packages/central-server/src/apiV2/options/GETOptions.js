import { GETHandler } from '../GETHandler';
import { allowNoPermissions } from '../../permissions';

export class GETOptions extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  async assertUserHasAccess() {
    await this.assertPermissions(allowNoPermissions);
  }

  async getPermissionsFilter(criteria, options) {
    return { dbConditions: criteria, dbOptions: options };
  }

  async getPermissionsViaParentFilter(criteria, options) {
    const dbConditions = { 'option.option_set_id': this.parentRecordId, ...criteria };

    return { dbConditions, dbOptions: options };
  }
}
