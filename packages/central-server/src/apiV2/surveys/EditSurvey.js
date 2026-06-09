import { EditHandler } from '../EditHandler';
import { SurveyEditor } from './surveyEditor';
import { convertFieldsToIds } from './convertFieldsToIds';

/**
 * See ./README.md
 */
export class EditSurvey extends EditHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  async editRecord() {
    const surveyEditor = new SurveyEditor(this.models, this.req.assertPermissions);

    const convertedFields = await convertFieldsToIds(this.models, this.updatedFields);

    return surveyEditor.edit(this.recordId, convertedFields);
  }
}
