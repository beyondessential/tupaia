/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { respond, ObjectValidator, constructRecordExistsWithId } from '@tupaia/utils';
import { CRUDHandler } from '../CRUDHandler';
import { assertBESAdminAccess } from '../../permissions';

export class TestExternalDatabaseConnection extends CRUDHandler {
  async validateRecordExists() {
    const validationCriteria = {
      id: [constructRecordExistsWithId(this.database, this.recordType)],
    };

    const validator = new ObjectValidator(validationCriteria);
    return validator.validate({ id: this.recordId }); // Will throw an error if not valid
  }

  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }

  async handleRequest() {
    await this.validateRecordExists();
    await this.assertUserHasAccess();

    const externalDatabaseConnection = await this.resourceModel.findById(this.recordId);

    const testResult = await externalDatabaseConnection.testConnection();

    respond(this.res, { success: testResult });
  }
}
