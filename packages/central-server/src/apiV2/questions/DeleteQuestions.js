import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertQuestionEditPermissions } from './assertQuestionPermissions';

export class DeleteQuestions extends DeleteHandler {
  async assertUserHasAccess() {
    const questionChecker = accessPolicy =>
      assertQuestionEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, questionChecker]));
  }
}
