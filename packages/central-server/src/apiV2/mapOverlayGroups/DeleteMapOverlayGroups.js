/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertMapOverlayGroupsEditPermissions } from './assertMapOverlayGroupsPermissions';

export class DeleteMapOverlayGroups extends DeleteHandler {
  async assertUserHasAccess() {
    const mapOverlayGroupChecker = accessPolicy =>
      assertMapOverlayGroupsEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, mapOverlayGroupChecker]),
    );
  }
}
