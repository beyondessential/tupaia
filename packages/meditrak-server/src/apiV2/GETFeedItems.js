/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { JOIN_TYPES } from '@tupaia/database';
import { GETHandler } from './GETHandler';
import { assertBESAdminAccess } from '../permissions';

export class GETFeedItems extends GETHandler {
  defaultJoinType = JOIN_TYPES.LEFT_OUTER;

  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }
}
