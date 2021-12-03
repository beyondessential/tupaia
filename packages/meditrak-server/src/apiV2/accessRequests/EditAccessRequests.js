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

  async validate() {
    if (Array.isArray(this.updatedFields)) {
      return this.updatedFields.map(r => this.validateRecordExists(r.id));
    }

    return this.validateRecordExists();
  }

  async editRecord(recordId = this.recordId, updatedFields = this.updatedFields) {
    if (Array.isArray(updatedFields)) {
      return updatedFields.map(r => this.editRecord(r.id, r));
    }

    const accessRequest = await this.models.accessRequest.findById(recordId);
    // Check Permissions
    const accessRequestChecker = accessPolicy =>
      assertAccessRequestEditPermissions(accessPolicy, this.models, this.recordId, updatedFields);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, accessRequestChecker]),
    );

    // Update Record
    const { approved } = accessRequest;
    if (approved !== null) {
      throw new ValidationError(`AccessRequest has already been processed`);
    }

    return this.models.accessRequest.updateById(recordId, {
      ...updatedFields,
      processed_by: this.req.userId,
      processed_date: new Date(),
    });
  }
}
