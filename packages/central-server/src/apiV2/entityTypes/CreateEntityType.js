/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { hasContent, isAString, ObjectValidator } from '@tupaia/utils';
import { BESAdminCreateHandler } from '../CreateHandler';

export class CreateEntityType extends BESAdminCreateHandler {
  async validateNewRecord() {
    const validator = new ObjectValidator({
      type: [hasContent, isAString],
    });
    await validator.validate(this.newRecordData);
  }

  async insertRecord() {
    const { type } = this.newRecordData;
    await this.models.entity.addEntityType(type);
  }
}
