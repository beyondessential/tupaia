/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertSurveyEditPermissions } from './assertSurveyPermissions';

export class DeleteSurveys extends DeleteHandler {
  async assertUserHasAccess() {
    const surveyChecker = accessPolicy =>
      assertSurveyEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, surveyChecker]));
  }
}
