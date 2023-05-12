/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { EditHandler } from '../EditHandler';
import { SurveyEditor } from '../import/importSurveys/SurveyEditor';

/**
 * See ./README.md
 */
export class EditSurvey extends EditHandler {
  permissionsFilteredInternally = true;

  // TODO: merge with SurveyEditor
  // async assertUserHasAccess() {
  //   const surveyChecker = accessPolicy =>
  //     assertSurveyEditPermissions(accessPolicy, this.models, this.recordId);
  //   await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, surveyChecker]));
  // }

  async editRecord() {
    const surveyEditor = new SurveyEditor(this.models, this.req.assertPermissions);
    return surveyEditor.edit(this.recordId, this.updatedFields);
  }
}
