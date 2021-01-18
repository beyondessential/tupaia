/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertOptionEditPermissions } from './assertOptionPermissions';

export class EditOptions extends EditHandler {
  async assertUserHasAccess() {
    const optionChecker = accessPolicy =>
      assertOptionEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, optionChecker]));
  }

  async editRecord() {
    await this.updateRecord();
  }
}
