/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { EditHandler } from './EditHandler';
import { assertBESAdminAccess } from '../../permissions';

export class BESAdminEditHandler extends EditHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }

  async editRecord() {
    await this.updateRecord();
  }
}
