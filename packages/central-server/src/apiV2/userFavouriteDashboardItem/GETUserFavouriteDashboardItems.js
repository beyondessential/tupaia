/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';

export class GETUserFavouriteDashboardItems extends GETHandler {
  async assertUserHasAccess() {
    this.req.flagPermissionsChecked(); // bypass permissions assertion
  }
}
