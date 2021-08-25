/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ValidationError } from '@tupaia/utils';
import { EditHandler } from '../EditHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
} from '../../permissions';
import { assertAccessRequestEditPermissions } from './assertAccessRequestPermissions';

/**
 * Handles PUT endpoints:
 * - /accessRequests/:accessRequestId
 */

export class EditAccessRequests extends EditHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to edit user entity permissions',
      ),
    );
  }

  async editRecord() {
    // Check Permissions
    const accessRequest = await this.models.accessRequest.findById(this.recordId);
    const accessRequestChecker = accessPolicy =>
      assertAccessRequestEditPermissions(
        accessPolicy,
        this.models,
        this.recordId,
        this.updatedFields,
      );
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, accessRequestChecker]),
    );

    // Update Record
    const { approved } = accessRequest;
    if (approved !== null) {
      throw new ValidationError(`AccessRequest has already been processed`);
    }
    return this.models.accessRequest.updateById(this.recordId, {
      ...this.updatedFields,
      processed_by: this.req.userId,
      processed_date: new Date(),
    });
  }
}
