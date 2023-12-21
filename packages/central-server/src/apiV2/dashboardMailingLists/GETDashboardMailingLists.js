/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { allowNoPermissions } from '../../permissions';
import { GETHandler } from '../GETHandler';

export class GETDashboardMailingLists extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(allowNoPermissions);
  }
}
