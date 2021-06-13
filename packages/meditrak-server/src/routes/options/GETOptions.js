/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { assertAdminPanelAccess } from '../../permissions';

export class GETOptions extends GETHandler {
  permissionsFilteredInternally = true;

  async assertUserHasAccess() {
    await this.assertPermissions(assertAdminPanelAccess);
  }

  async getPermissionsFilter(criteria, options) {
    return { dbConditions: criteria, dbOptions: options };
  }

  async getPermissionsViaParentFilter(criteria, options) {
    const dbConditions = { 'option.option_set_id': this.parentRecordId, ...criteria };

    return { dbConditions, dbOptions: options };
  }
}
