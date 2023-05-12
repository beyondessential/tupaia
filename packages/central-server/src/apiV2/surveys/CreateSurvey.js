/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { CreateHandler } from '../CreateHandler';
import { SurveyEditor } from '../import/importSurveys/SurveyEditor';

/**
 * See ./README.md
 */
export class CreateSurvey extends CreateHandler {
  permissionsFilteredInternally = true;

  // TODO: merge with SurveyEditor
  // async assertUserHasAccess() {
  //   const surveyChecker = accessPolicy =>
  //     assertSurveyEditPermissions(accessPolicy, this.models, this.recordId);
  //   await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, surveyChecker]));
  // }

  async createRecord() {
    const surveyEditor = new SurveyEditor(this.models, this.req.assertPermissions);
    return surveyEditor.create(this.newRecordData);
  }
}
