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
import { assertAnswerPermissions, assertAnswerEditPermissions } from './assertAnswerPermissions';

/**
 * Handles PUT endpoints:
 * - /answers/:answerId
 * - /surveyResponse/:surveyResponseId/answers/:answerId
 */

export class EditAnswers extends EditHandler {
  async assertUserHasAccess() {
    // Check the user has either:
    // - BES admin access
    // - Permission to view the answer AND Tupaia Admin Panel access anywhere
    const answerPermissionChecker = accessPolicy =>
      assertAnswerPermissions(accessPolicy, this.models, this.recordId);

    await this.assertPermissions(
      assertAnyPermissions([
        assertBESAdminAccess,
        assertAllPermissions([assertAdminPanelAccess, answerPermissionChecker]),
      ]),
    );
  }

  async editRecord() {
    // Check we aren't editing the answer in a way that could break something
    const answerEditPermissionChecker = accessPolicy =>
      assertAnswerEditPermissions(accessPolicy, this.models, this.recordId, this.updatedFields);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, answerEditPermissionChecker]),
    );

    return this.updateRecord();
  }
}
