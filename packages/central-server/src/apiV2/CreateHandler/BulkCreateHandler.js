import { respond, ObjectValidator, DatabaseError } from '@tupaia/utils';
import { constructNewRecordValidationRules } from '../utilities';
import { CRUDHandler } from '../CRUDHandler';

/**
 * Responds to POST requests for a resource
 * Can take a single object or an array of objects
 */
export class BulkCreateHandler extends CRUDHandler {
  constructor(req, res) {
    super(req, res);
    this.newRecordData = this.req.body;
  }

  async handleRequest() {
    let customResponseDetails = {};

    try {
      if (Array.isArray(this.newRecordData)) {
        // This is a bulk record creation
        await this.models.wrapInTransaction(async transactingModels => {
          await this.createRecords(transactingModels, this.newRecordData);
        });
      } else {
        // This is a single new record creation
        customResponseDetails = await this.createRecords(this.models, [this.newRecordData]);
      }
    } catch (error) {
      if (error.respond) {
        throw error; // Already a custom error with a responder
      } else {
        throw new DatabaseError('Error creating records', error);
      }
    }

    respond(
      this.res,
      {
        message: `Successfully created ${this.resource}`,
        ...customResponseDetails,
      },
      200,
    );
  }

  async validate() {
    return this.validateNewRecord();
  }

  // eslint-disable-next-line no-unused-vars
  async createRecords(transactingModels, newRecordData) {
    throw new Error('Any BulkCreateHandler must implement createRecords()');
  }

  async insertRecords(transactingModels, newRecordData) {
    const model = transactingModels.getModelForDatabaseRecord(this.recordType);
    for (const record of newRecordData) {
      await model.create(record);
    }
  }

  async validateRecords(updatedRecords) {
    for (const record of updatedRecords) {
      await this.validateNewRecords(record);
    }
  }

  async validateNewRecords(newRecord) {
    // Validate that the record matches required format
    const dataToValidate =
      this.parentRecordType !== '' && this.parentRecordId
        ? { [`${this.parentRecordType}_id`]: this.parentRecordId, ...newRecord }
        : newRecord;

    const validator = new ObjectValidator(
      constructNewRecordValidationRules(this.models, this.recordType, this.parentRecordType),
    );
    return validator.validate(dataToValidate); // Will throw an error if not valid
  }
}
