/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { assertAdminPanelAccess } from '../../permissions';
import { createSyncGroupDBFilter } from './assertSyncGroupPermissions';

export class GETSyncGroupLogsCount extends GETHandler {
  permissionsFilteredInternally = true;

  async buildResponse() {
    const { recordId } = this;

    const dataServiceSyncGroup = await this.models.dataServiceSyncGroup.findById(recordId);
    const count = await dataServiceSyncGroup.getLogsCount();
    return { body: { logsCount: count } };
  }

  async assertUserHasAccess() {
    await this.assertPermissions(assertAdminPanelAccess);
  }

  async getPermissionsFilter(criteria, options) {
    return createSyncGroupDBFilter(this.accessPolicy, this.models, criteria, options);
  }
}
