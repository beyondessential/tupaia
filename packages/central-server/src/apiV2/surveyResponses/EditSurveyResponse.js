/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { EditHandler } from '../EditHandler';
import { assertSurveyResponsePermissions } from './assertSurveyResponsePermissions';

export class EditSurveyResponse extends EditHandler {
  async assertUserHasAccess() {
    // Check the user has either:
    // - BES admin access
    // - Permission to view the surveyResponse AND Tupaia Admin Panel access anywhere
    const surveyResponsePermissionChecker = accessPolicy =>
      assertSurveyResponsePermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyResponsePermissionChecker]),
    );
  }

  async editRecord() {
    await this.updateRecord();
  }
}
