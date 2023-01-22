/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { CreateHandler } from '../CreateHandler';
import {
  assertAnyPermissions,
  assertAdminPanelAccess,
  assertBESAdminAccess,
} from '../../permissions';

export class CreateDataTables extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to create a Data Table',
      ),
    );
  }

  async createRecord() {
    return this.insertRecord();
  }
}
