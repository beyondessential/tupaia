import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertSurveyScreenComponentEditPermissions } from './assertSurveyScreenComponentPermissions';

export class EditSurveyScreenComponents extends EditHandler {
  async assertUserHasAccess() {
    const surveyScreenComponentChecker = accessPolicy =>
      assertSurveyScreenComponentEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyScreenComponentChecker]),
    );
  }

  async editRecord() {
    const screenComponentFields = await this.models.surveyScreenComponent.fetchFieldNames();
    const updatedScreenComponentData = screenComponentFields.reduce((current, fieldName) => {
      if (!(fieldName in this.updatedFields)) {
        return current;
      }
      if (fieldName === 'config') {
        current.config = JSON.stringify(this.updatedFields.config);
        return current;
      }
      current[fieldName] = this.updatedFields[fieldName];
      return current;
    }, {});
    const questionFields = await this.models.question.fetchFieldNames();
    const updatedQuestionData = questionFields.reduce((current, fieldName) => {
      const columnName = `question.${fieldName}`;
      if (columnName in this.updatedFields) {
        current[fieldName] = this.updatedFields[columnName];
      }
      return current;
    }, {});
    const updates = [];
    if (Object.entries(updatedScreenComponentData).length > 0) {
      updates.push(
        this.models.surveyScreenComponent.updateById(this.recordId, updatedScreenComponentData),
      );
    }
    if (Object.entries(updatedQuestionData).length > 0) {
      const screenComponent = await this.models.surveyScreenComponent.findById(this.recordId);
      const question = await screenComponent.question();
      updates.push(this.models.question.updateById(question.id, updatedQuestionData));
    }

    return Promise.all(updates);
  }
}
