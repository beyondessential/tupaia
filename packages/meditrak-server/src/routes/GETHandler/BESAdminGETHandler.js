/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from './GETHandler';
import { assertBESAdminAccess } from '../../permissions';

/**
 * GET Handler with a gated permission for BES admin
 * Used for endpoints that only BES admins have access to
 */

export class BESAdminGETHandler extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }
}
