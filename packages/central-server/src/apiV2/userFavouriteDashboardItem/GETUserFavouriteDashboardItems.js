/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';

export class GETUserFavouriteDashboardItems extends GETHandler {
  async assertUserHasAccess() {
    this.req.flagPermissionsChecked(); // bypass permissions assertion
  }

  async findRecords(criteria, options) {
    const { user_id: userId } = JSON.parse(this.req.query.filter);
    const loggedUserId = this.req.userId;
    if (!userId || userId !== loggedUserId) {
      return [];
    }

    return this.database.find(this.recordType, criteria, options);
  }
}
