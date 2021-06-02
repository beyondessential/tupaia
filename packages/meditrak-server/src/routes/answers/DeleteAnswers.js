/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DeleteHandler } from '../DeleteHandler';
import {
  assertAllPermissions,
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
} from '../../permissions';
import { assertAnswerPermissions } from './assertAnswerPermissions';

/**
 * Handles DELETE endpoints:
 * - /answers/:answerId
 * - /surveyResponses/:surveyResponseId/answers/:answerId
 */

export class DeleteAnswers extends DeleteHandler {
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
}
