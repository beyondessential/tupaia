/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { assertBESAdminAccess } from '../../permissions';

export class GETExternalDatabaseConnections extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }
}
