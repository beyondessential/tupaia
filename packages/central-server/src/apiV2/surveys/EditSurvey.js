/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { EditHandler } from '../EditHandler';
import { SurveyEditor } from './surveyEditor';
import { convertNamesToIds } from './convertNamesToIds';

/**
 * See ./README.md
 */
export class EditSurvey extends EditHandler {
  permissionsFilteredInternally = true;

  async editRecord() {
    const surveyEditor = new SurveyEditor(this.models, this.req.assertPermissions);

    const convertedFields = await convertNamesToIds(this.models, this.updatedFields);

    return surveyEditor.edit(this.recordId, convertedFields);
  }
}
