/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { CreateHandler } from '../CreateHandler';
import { SurveyEditor } from './SurveyEditor';
import { convertNamesToIds } from './convertNamesToIds';

/**
 * See ./README.md
 */
export class CreateSurvey extends CreateHandler {
  permissionsFilteredInternally = true;

  async createRecord() {
    const surveyEditor = new SurveyEditor(this.models, this.req.assertPermissions);

    const convertedFields = await convertNamesToIds(this.models, this.newRecordData);

    if (this.req.query.strictValidationMode === 'false') {
      surveyEditor.setStrictValidationMode(false);
    }

    return surveyEditor.create(convertedFields);
  }
}
