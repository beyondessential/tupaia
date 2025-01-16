import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertQuestionEditPermissions } from './assertQuestionPermissions';

export class EditQuestions extends EditHandler {
  async assertUserHasAccess() {
    const questionChecker = accessPolicy =>
      assertQuestionEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, questionChecker]));
  }

  async editRecord() {
    await this.updateRecord();
  }
}
