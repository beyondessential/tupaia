/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { BESAdminEditHandler } from '../EditHandler';

export class EditEntity extends BESAdminEditHandler {
  async updateRecord() {
    // ensure only name field can be updated
    const updatedFieldKeys = Object.keys(this.updatedFields);
    if (updatedFieldKeys.length !== 1 && updatedFieldKeys.includes('name')) {
      throw Error('Fields other than "name" cannot be updated');
    }
    await this.models.entity.updateById(this.recordId, this.updatedFields);
  }
}
