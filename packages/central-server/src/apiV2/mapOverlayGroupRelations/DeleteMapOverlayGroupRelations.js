/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DeleteHandler } from '../DeleteHandler';
import {
  assertAdminPanelAccess,
  assertAnyPermissions,
  assertBESAdminAccess,
} from '../../permissions';

export class DeleteMapOverlayGroupRelations extends DeleteHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, assertAdminPanelAccess]),
    );
  }
}
