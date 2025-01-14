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
