import { AnalyticsRefresher } from '@tupaia/database';
import { DeleteHandler } from '../DeleteHandler';
import {
  assertAllPermissions,
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
} from '../../permissions';
import { assertSurveyResponsePermissions } from './assertSurveyResponsePermissions';

/**
 * Handles DELETE endpoints:
 * - /surveyResponses/:surveyResponseId
 */

export class DeleteSurveyResponses extends DeleteHandler {
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

  async deleteRecord() {
    await super.deleteRecord();

    if (this.req.query.waitForAnalyticsRebuild === 'true') {
      // TODO: Rework this functionality, as directly calling an analytics refresh here is both inefficient
      // and may create duplicate records in the analytics table
      const { database } = this.models;
      await AnalyticsRefresher.refreshAnalytics(database);
    }
  }
}
