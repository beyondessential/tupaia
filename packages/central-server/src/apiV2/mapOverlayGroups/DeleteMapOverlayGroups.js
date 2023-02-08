/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';

export class DeleteMapOverlayGroups extends DeleteHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertAnyPermissions(assertBESAdminAccess));
  }
}
