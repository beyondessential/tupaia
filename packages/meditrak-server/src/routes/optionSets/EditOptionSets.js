/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertOptionSetEditPermissions } from './assertOptionSetPermissions';

export class EditOptionSets extends EditHandler {
  async assertUserHasAccess() {
    const optionSetChecker = accessPolicy =>
      assertOptionSetEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, optionSetChecker]));
  }

  async editRecord() {
    const optionSet = await this.models.optionSet.findById(this.recordId);
    const originalData = await optionSet.getData();
    const updatedModel = { ...originalData, ...this.updatedFields };

    return this.models.optionSet.updateById(this.recordId, updatedModel);
  }
}
