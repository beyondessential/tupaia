/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { assertAdminPanelAccess } from '../../permissions';

export class GETOptionSets extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertAdminPanelAccess);
  }
}
