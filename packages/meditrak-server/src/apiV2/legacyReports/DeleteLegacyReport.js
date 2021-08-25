/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertLegacyReportEditPermissions } from './assertLegacyReportsPermissions';

export class DeleteLegacyReport extends DeleteHandler {
  async assertUserHasAccess() {
    const legacyReportChecker = accessPolicy =>
      assertLegacyReportEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, legacyReportChecker]));
  }
}
