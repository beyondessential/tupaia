import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { EditHandler } from '../EditHandler';

export class EditSurveyResponse extends EditHandler {
  async assertUserHasAccess() {
    // Check the user has either:
    // - BES admin access
    // - Permission to view the surveyResponse AND Tupaia Admin Panel access anywhere
    const surveyResponsePermissionChecker = async accessPolicy =>
      await this.models.surveyResponse.assertCanRead(this.models, accessPolicy, this.recordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyResponsePermissionChecker]),
    );
  }

  async editRecord() {
    await this.updateRecord();
  }
}
