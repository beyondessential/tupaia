/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from './GETHandler';
import { assertTupaiaAdminPanelAccess } from '../../permissions';

export class TupaiaAdminGETHandler extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertTupaiaAdminPanelAccess);
  }
}
