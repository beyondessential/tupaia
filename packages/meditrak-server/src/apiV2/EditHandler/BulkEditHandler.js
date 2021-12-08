/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  constructRecordExistsWithId,
  DatabaseError,
  ObjectValidator,
  respond,
} from '@tupaia/utils';
import { CRUDHandler } from '../CRUDHandler';

/**
 * Responds to PUT requests for a resource
 * Can take a single object or an array of objects
 */
export class BulkEditHandler extends CRUDHandler {
  constructor(req, res) {
    super(req, res);
    this.updatedFields = this.req.body;
  }

  async handleRequest() {
    if (Array.isArray(this.updatedFields)) {
      await this.editRecords();
    } else {
      await this.validate(this.recordId, this.updatedFields);
      await this.editRecord(this.models, this.recordId, this.updatedFields);
    }

    respond(this.res, { message: `Successfully updated ${this.resource}` });
  }

  async editRecords() {
    try {
      await this.models.wrapInTransaction(async transactingModels => {
        for (const updatedFields of this.updatedFields) {
          await this.validate(updatedFields.id, updatedFields);
          await this.editRecord(transactingModels, updatedFields.id, updatedFields);
        }
      });
    } catch (error) {
      if (error.respond) {
        throw error; // Already a custom error with a responder
      } else {
        throw new DatabaseError('Error editing records', error);
      }
    }
  }

  async editRecord() {
    throw new Error('Any EditHandler must implement editRecord()');
  }

  async updateRecord() {
    await this.models
      .getModelForDatabaseType(this.recordType)
      .updateById(this.recordId, this.updatedFields);
  }

  async validate(recordId, updatedFields) {
    return this.validateRecordExists(recordId, updatedFields);
  }

  async validateRecordExists(recordId) {
    const validationCriteria = {
      id: [constructRecordExistsWithId(this.database, this.recordType)],
    };

    const validator = new ObjectValidator(validationCriteria);
    return validator.validate({ id: recordId }); // Will throw an error if not valid
  }
}
