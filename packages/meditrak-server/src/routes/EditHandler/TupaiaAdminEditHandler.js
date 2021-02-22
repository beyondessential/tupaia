/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { EditHandler } from './EditHandler';
import { assertTupaiaAdminPanelAccess } from '../../permissions';

export class TupaiaAdminEditHandler extends EditHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertTupaiaAdminPanelAccess);
  }

  async editRecord() {
    await this.updateRecord();
  }
}
