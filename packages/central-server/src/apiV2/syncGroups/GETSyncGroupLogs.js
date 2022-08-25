/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { assertAdminPanelAccess } from '../../permissions';
import { createSyncGroupDBFilter } from './assertSyncGroupPermissions';

export class GETSyncGroupLogs extends GETHandler {
  permissionsFilteredInternally = true;

  async buildResponse() {
    const { limit, offset } = this.req.query;
    const { recordId } = this;

    const dataServiceSyncGroup = await this.models.dataServiceSyncGroup.findById(recordId);
    const logs = await dataServiceSyncGroup.getLatestLogs(limit, offset);
    const logObjects = logs.map(({ timestamp, log_message: logMessage }) => ({
      timestamp,
      message: logMessage,
    }));
    return { body: { logs: logObjects } };
  }

  async assertUserHasAccess() {
    await this.assertPermissions(assertAdminPanelAccess);
  }

  async getPermissionsFilter(criteria, options) {
    return createSyncGroupDBFilter(this.accessPolicy, this.models, criteria, options);
  }
}
