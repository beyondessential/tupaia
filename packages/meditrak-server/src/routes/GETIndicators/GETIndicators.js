/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { assertBESAdminAccess } from '../../permissions';
/**
 * Handles endpoints:
 * - /indicator
 * - /indicator/:indicatorId
 */
export class GETIndicators extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }
}
