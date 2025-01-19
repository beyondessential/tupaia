import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertSurveyEditPermissions } from './assertSurveyPermissions';

/**
 * See ./README.md
 */
export class DeleteSurveys extends DeleteHandler {
  async assertUserHasAccess() {
    const surveyChecker = accessPolicy =>
      assertSurveyEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, surveyChecker]));
  }
}
