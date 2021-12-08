/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ValidationError } from '@tupaia/utils';
import { BulkEditHandler } from '../EditHandler';
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

export class EditAccessRequests extends BulkEditHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to edit user entity permissions',
      ),
    );
  }

  async editRecord(models, recordId, updatedFields) {
    const accessRequest = await models.accessRequest.findById(recordId);
    // Check Permissions
    const accessRequestChecker = accessPolicy =>
      assertAccessRequestEditPermissions(accessPolicy, models, this.recordId, updatedFields);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, accessRequestChecker]),
    );

    // Update Record
    const { approved } = accessRequest;
    if (approved !== null) {
      throw new ValidationError(`AccessRequest has already been processed`);
    }

    return models.accessRequest.updateById(recordId, {
      ...updatedFields,
      processed_by: this.req.userId,
      processed_date: new Date(),
    });
  }
}
