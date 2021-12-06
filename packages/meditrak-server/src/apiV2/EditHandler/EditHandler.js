/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { respond, ObjectValidator, constructRecordExistsWithId } from '@tupaia/utils';
import { CRUDHandler } from '../CRUDHandler';

/**
 * Responds to PUT requests for a resource
 */

export class EditHandler extends CRUDHandler {
  constructor(req, res) {
    super(req, res);
    this.updatedFields = this.req.body;
  }

  async handleRequest() {
    await this.validate();

    if (Array.isArray(this.updatedFields)) {
      await Promise.all(this.updatedFields.map(r => this.editRecord(r.id, r)));
    } else {
      await this.editRecord();
    }

    respond(this.res, { message: `Successfully updated ${this.resource}` });
  }

  async validate() {
    if (Array.isArray(this.updatedFields)) {
      return this.updatedFields.map(r => this.validateRecordExists(r.id));
    }

    return this.validateRecordExists();
  }

  async editRecord() {
    throw new Error('Any EditHandler must implement editRecord()');
  }

  async updateRecord() {
    await this.models
      .getModelForDatabaseType(this.recordType)
      .updateById(this.recordId, this.updatedFields);
  }

  async validateRecordExists(recordId = this.recordId) {
    const validationCriteria = {
      id: [constructRecordExistsWithId(this.database, this.recordType)],
    };

    const validator = new ObjectValidator(validationCriteria);
    return validator.validate({ id: recordId }); // Will throw an error if not valid
  }
}
