/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from './GETHandler';
import { assertTupaiaAdminPanelAccess, assertAnyPermissions } from '../permissions';

export class GETPermissionGroups extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertTupaiaAdminPanelAccess],
        'You need Tupaia Admin Panel access to permission groups',
      ),
    );
  }
}
