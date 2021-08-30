/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertOptionSetEditPermissions } from './assertOptionSetPermissions';

export class DeleteOptionSets extends DeleteHandler {
  async assertUserHasAccess() {
    const optionSetChecker = accessPolicy =>
      assertOptionSetEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, optionSetChecker]));
  }
}
