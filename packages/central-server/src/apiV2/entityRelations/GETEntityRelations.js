/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';

export class GETEntityRelations extends GETHandler {
  // TODO add permissions - see GetDashboardRelations
  async assertUserHasAccess() {
    await this.assertPermissions(() => true);
  }

  // TODO add tests if this is going to be used
}
