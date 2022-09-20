/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { constructRecordExistsWithId, DatabaseError, respond } from '@tupaia/utils';
import { CRUDHandler } from '../CRUDHandler';

/**
 * Responds to DELETE requests for a resource
 */

export class DeleteHandler extends CRUDHandler {
  async handleRequest() {
    await this.validate();
    await this.deleteRecord();
    respond(this.res, { message: `Successfully deleted ${this.resource}` });
  }

  async validate() {
    // Validate that the record to be deleted actually exists (will throw an error if not)
    await constructRecordExistsWithId(this.resourceModel)(this.recordId);
  }

  async deleteRecord() {
    try {
      await this.resourceModel.deleteById(this.recordId);
    } catch (error) {
      if (error.constraint && error.constraint.endsWith('fkey')) {
        throw new DatabaseError(
          `Cannot delete ${this.resource} while there are still records in the ${error.table} table`,
        );
      }
      throw error;
    }
  }
}
