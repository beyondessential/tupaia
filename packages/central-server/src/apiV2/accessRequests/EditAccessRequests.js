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

  async editRecords(transactingModels, updatedRecords) {
    await this.validateRecords(updatedRecords);

    for (const record of updatedRecords) {
      await this.checkPermissionForRecord(transactingModels, record.id, record);
    }

    await this.updateRecords(
      transactingModels,
      updatedRecords.map(record => ({
        ...record,
        processed_by: this.req.userId,
        processed_date: new Date(),
      })),
    );
  }

  async checkPermissionForRecord(models, recordId, updatedRecord) {
    const accessRequest = await models.accessRequest.findById(recordId);
    const accessRequestData = await accessRequest.getData();
    // Check Permissions
    const accessRequestChecker = accessPolicy =>
      assertAccessRequestEditPermissions(accessPolicy, models, recordId, {
        ...accessRequestData,
        ...updatedRecord,
      });
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, accessRequestChecker]),
    );

    // Update Record
    const { approved } = accessRequest;
    if (approved !== null) {
      throw new ValidationError(`AccessRequest has already been processed`);
    }
  }
}
