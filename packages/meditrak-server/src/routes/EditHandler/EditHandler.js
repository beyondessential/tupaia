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
    await this.editRecord();
    respond(this.res, { message: `Successfully updated ${this.resource}` });
  }

  async validate() {
    // dashboardReport, mapOverlay and dashboardGroup use different id formats and are the only endpoints
    // which need to overwrite the validation functionality
    // TODO remove when this task is done https://github.com/beyondessential/tupaia-backlog/issues/723
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

  async validateRecordExists() {
    const validationCriteria = {
      id: [constructRecordExistsWithId(this.database, this.recordType)],
    };

    const validator = new ObjectValidator(validationCriteria);
    return validator.validate({ id: this.recordId }); // Will throw an error if not valid
  }
}
