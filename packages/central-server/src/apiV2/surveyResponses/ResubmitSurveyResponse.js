/* eslint-disable camelcase */
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
import { handleSurveyResponse, handleAnswers } from './handleResubmission';
import { validateResubmission } from './validateResubmission';

/**
 * Handles POST endpoint:
 * - /surveyResponses/:surveyResponseId/resubmit
 * handles both edits and creation of new answers
 */

export class ResubmitSurveyResponse extends EditHandler {
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

    await this.models.wrapInTransaction(async transactingModels => {
      await validateResubmission(transactingModels, this.updatedFields, this.recordId);
      await handleAnswers(this.models, this.updatedFields.answers, this.recordId);
      return handleSurveyResponse(this.models, this.updatedFields, this.recordType, this.recordId);
    });
  }
}
