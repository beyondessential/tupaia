/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { ValidationError } from '@tupaia/utils';
import { BESAdminEditHandler } from '../EditHandler';

export class EditEntityType extends BESAdminEditHandler {
  async validate() {
    const entityTypes = await this.models.entity.getEntityTypes();
    if (!entityTypes.includes(this.recordId)) {
      throw new ValidationError(`No entity_type with name: ${this.recordId}`);
    }
  }

  async updateRecord() {
    const { type } = this.updatedFields;
    if (type) {
      await this.models.entity.renameEntityType(this.recordId, type);
    }
  }
}
