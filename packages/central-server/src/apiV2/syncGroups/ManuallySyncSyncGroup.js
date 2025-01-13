import { DataBroker } from '@tupaia/data-broker';
import { respond, ObjectValidator, constructRecordExistsWithId } from '@tupaia/utils';
import { CRUDHandler } from '../CRUDHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertSyncGroupEditPermissions } from './assertSyncGroupPermissions';
import { syncWithKoBo } from '../../kobo';

const manualSyncFunctions = {
  kobo: (models, syncGroupCode) => {
    const dataBroker = new DataBroker();
    return syncWithKoBo(models, dataBroker, syncGroupCode);
  },
};

export class ManuallySyncSyncGroup extends CRUDHandler {
  async validateRecordExists() {
    const validationCriteria = {
      id: [constructRecordExistsWithId(this.database, this.recordType)],
    };

    const validator = new ObjectValidator(validationCriteria);
    return validator.validate({ id: this.recordId }); // Will throw an error if not valid
  }

  async assertUserHasAccess() {
    const syncGroupChecker = accessPolicy =>
      assertSyncGroupEditPermissions(accessPolicy, this.models, this.recordId);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, syncGroupChecker]));
  }

  async handleRequest() {
    await this.validateRecordExists();
    await this.assertUserHasAccess();

    const dataServiceSyncGroup = await this.models.dataServiceSyncGroup.findById(this.recordId);

    const { service_type: serviceType, code: syncGroupCode } = dataServiceSyncGroup;
    const syncFunction = manualSyncFunctions[serviceType];

    if (!syncFunction) {
      throw new Error(`Manual sync unsupported for service type: ${serviceType}`);
    }

    // Kick off sync and respond immediately (results of sync can be checked in sync group logs)
    syncFunction(this.models, syncGroupCode);
    respond(this.res, { message: 'Sync triggered' });
  }
}
