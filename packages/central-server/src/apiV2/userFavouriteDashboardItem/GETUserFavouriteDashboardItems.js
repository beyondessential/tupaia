/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { assertAnyPermissions } from '../../permissions';
import { GETHandler } from '../GETHandler';

export class GETUserFavouriteDashboardItems extends GETHandler {
  async assertUserHasAccess() {
    const assertUserId = () => {
      const { user_id: userId } = JSON.parse(this.req.query.filter);

      if (userId !== this.user_id) {
        throw new Error(`userId: ${userId} and logged in user '${this.user_id}' is not the same'`);
      }

      return true;
    };

    await this.assertPermissions(assertAnyPermissions([assertUserId]));
  }

  async findRecords(criteria, options) {
    const { user_id: userId } = JSON.parse(this.req.query.filter);
    if (!userId) {
      return [];
    }

    return this.database.find(this.recordType, criteria, options);
  }
}
