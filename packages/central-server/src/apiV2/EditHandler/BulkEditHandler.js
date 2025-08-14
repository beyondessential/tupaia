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
    this.updatedRecords = this.req.body;
  }

  async handleRequest() {
    if (this.recordId) {
      // This is a single record update
      if (Array.isArray(this.updatedRecords)) {
        throw new Error('Edit with record id must submit an object as payload');
      }

      const record = { ...this.updatedRecords, id: this.recordId };
      await this.editRecords(this.models, [record]);
    } else {
      // This should be an array of records
      if (!Array.isArray(this.updatedRecords)) {
        throw new Error('Bulk edit without recordId must submit an array as payload');
      }

      try {
        await this.models.wrapInTransaction(async transactingModels => {
          await this.editRecords(transactingModels, this.updatedRecords);
        });
      } catch (error) {
        if (error.respond) {
          throw error; // Already a custom error with a responder
        } else {
          throw new DatabaseError('Error updating records', error);
        }
      }
    }

    respond(this.res, { message: `Successfully updated ${this.resource}` }, 200);
  }

  // eslint-disable-next-line no-unused-vars
  async editRecords(transactingModels, updatedRecords) {
    throw new Error('Any BulkEditHandler must implement editRecords()');
  }

  async updateRecords(transactingModels, updatedRecords) {
    const model = transactingModels.getModelForDatabaseRecord(this.recordType);
    for (const record of updatedRecords) {
      await model.updateById(record.id, record);
    }
  }

  async validateRecords(updatedRecords) {
    for (const record of updatedRecords) {
      await this.validateRecordExists(record.id);
    }
  }

  async validateRecordExists(recordId) {
    const validationCriteria = {
      id: [constructRecordExistsWithId(this.database, this.recordType)],
    };

    const validator = new ObjectValidator(validationCriteria);
    return validator.validate({ id: recordId }); // Will throw an error if not valid
  }
}
