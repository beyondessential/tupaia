/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { assertAnyPermissions } from '../../permissions';
import { GETHandler } from '../GETHandler';

export class GETUserFavouriteDashboardItems extends GETHandler {
  async assertUserHasAccess() {
    const assertUserId = () => {
      const { userId } = JSON.parse(this.req.query.filter);
      if (!userId || !this.user_id || userId !== this.user_id) {
        return false;
      }
      return true;
    };

    await this.assertPermissions(assertAnyPermissions([assertUserId]));
  }
}
