/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { respond, ObjectValidator, DatabaseError } from '@tupaia/utils';
import { constructNewRecordValidationRules } from '../utilities';
import { CRUDHandler } from '../CRUDHandler';

/**
 * Responds to POST requests for a resource
 */

export class CreateHandler extends CRUDHandler {
  constructor(req, res) {
    super(req, res);
    this.newRecordData = this.req.body;
  }

  async handleRequest() {
    await this.validate();
    let customResponseDetails = {};
    try {
      customResponseDetails = await this.createRecord();
    } catch (error) {
      throw new DatabaseError('Creating record', error);
    }
    respond(this.res, {
      message: `Successfully created ${this.resource}`,
      ...customResponseDetails,
    });
  }

  async validate() {
    return this.validateNewRecord();
  }

  async createRecord() {
    throw new Error('Any CreateHandler must implement createRecord()');
  }

  async insertRecord() {
    await this.models.getModelForDatabaseType(this.recordType).create(this.newRecordData);
  }

  async validateNewRecord() {
    // Validate that the record matches required format
    const dataToValidate =
      this.parentRecordType !== '' && this.parentRecordId
        ? { [`${this.parentRecordType}_id`]: this.parentRecordId, ...this.newRecordData }
        : this.newRecordData;

    const validator = new ObjectValidator(
      constructNewRecordValidationRules(this.models, this.recordType, this.parentRecordType),
    );
    return validator.validate(dataToValidate); // Will throw an error if not valid
  }
}
