/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';

export class EditEntityRelations extends EditHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess]));
  }

  async editRecord() {
    await this.updateRecord();
  }
}
