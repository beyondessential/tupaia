/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { EditHandler } from '../EditHandler';
import {
  assertAllPermissions,
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
} from '../../permissions';
import {
  assertSurveyResponsePermissions,
  assertSurveyResponseEditPermissions,
} from './assertSurveyResponsePermissions';

/**
 * Handles PUT endpoints:
 * - /surveyResponses/:surveyResponseId
 */

export class EditSurveyResponses extends EditHandler {
  async assertUserHasAccess() {
    // Check the user has either:
    // - BES admin access
    // - Permission to view the surveyResponse AND Tupaia Admin Panel access anywhere
    const surveyResponsePermissionChecker = accessPolicy =>
      assertSurveyResponsePermissions(accessPolicy, this.models, this.recordId);

    await this.assertPermissions(
      assertAnyPermissions([
        assertBESAdminAccess,
        assertAllPermissions([assertAdminPanelAccess, surveyResponsePermissionChecker]),
      ]),
    );
  }

  async editRecord() {
    // Check we aren't editing the surveyResponse in a way that could break something
    const surveyResponseEditPermissionChecker = accessPolicy =>
      assertSurveyResponseEditPermissions(
        accessPolicy,
        this.models,
        this.recordId,
        this.updatedFields,
      );
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyResponseEditPermissionChecker]),
    );

    return this.updateRecord();
  }
}
