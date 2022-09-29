/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { ValidationError } from '@tupaia/utils';
import { BESAdminDeleteHandler } from '../DeleteHandler';

export class DeleteEntityType extends BESAdminDeleteHandler {
  async validate() {
    const entityTypes = await this.models.entity.getEntityTypes();
    if (!entityTypes.includes(this.recordId)) {
      throw new ValidationError(`No entity_type with name: ${this.recordId}`);
    }
  }

  async deleteRecord() {
    await this.models.entity.removeEntityType(this.recordId);
  }
}
