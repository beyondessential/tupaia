/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { assertAdminPanelAccess } from '../../permissions';
import { createQuestionDBFilter } from './assertQuestionPermissions';

export class GETQuestions extends GETHandler {
  permissionsFilteredInternally = true;

  async assertUserHasAccess() {
    await this.assertPermissions(assertAdminPanelAccess);
  }

  async getPermissionsFilter(criteria, options) {
    return createQuestionDBFilter(this.accessPolicy, this.models, criteria, options);
  }
}
