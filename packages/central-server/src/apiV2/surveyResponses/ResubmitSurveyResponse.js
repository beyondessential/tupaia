/* eslint-disable camelcase */
/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { S3, S3Client } from '@tupaia/utils';
import { AnalyticsRefresher } from '@tupaia/database';
import fs from 'fs';
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
import { handleSurveyResponse, handleAnswers } from './resubmission/handleResubmission';
import { validateResubmission } from './resubmission/validateResubmission';

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
      const currentSurveyResponse = await transactingModels.surveyResponse.findOne({
        id: this.recordId,
      });
      if (!currentSurveyResponse) {
        throw Error('Survey response not found.');
      }
      await validateResubmission(transactingModels, this.updatedFields, currentSurveyResponse);
      await handleAnswers(this.models, this.updatedFields, currentSurveyResponse);
      await handleSurveyResponse(
        this.models,
        this.updatedFields,
        this.recordType,
        currentSurveyResponse,
      );
      if (this.req.files) {
        // Upload files last so that we don't end up with uploaded files if db changes fail
        for (const file of this.req.files) {
          const uniqueFileName = file.fieldname;
          const readableStream = fs.createReadStream(file.path); // see https://github.com/aws/aws-sdk-js-v3/issues/2522
          const s3Client = this.getS3client();
          await s3Client.uploadFile(uniqueFileName, readableStream);
        }
      }

      if (this.req.query.waitForAnalyticsRebuild) {
        const { database } = transactingModels;
        await AnalyticsRefresher.refreshAnalytics(database);
      }
    });
  }

  // Workaround to allow us to test this route, remove after S3Client is mocked after RN-982
  getS3client() {
    if (!this.s3Client) {
      this.s3Client = new S3Client(new S3());
    }
    return this.s3Client;
  }
}
