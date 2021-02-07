/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertSurveyScreenComponentEditPermissions } from './assertSurveyScreenComponentPermissions';

export class DeleteSurveyScreenComponents extends DeleteHandler {
  async assertUserHasAccess() {
    const surveyScreenComponentChecker = accessPolicy =>
      assertSurveyScreenComponentEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyScreenComponentChecker]),
    );
  }
}
