/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { CreateHandler } from '../CreateHandler';
import { SurveyEditor } from './surveyEditor';
import { convertFieldsToIds } from './convertFieldsToIds';

/**
 * See ./README.md
 */
export class CreateSurvey extends CreateHandler {
  permissionsFilteredInternally = true;

  async createRecord() {
    const surveyEditor = new SurveyEditor(this.models, this.req.assertPermissions);

    const convertedFields = await convertFieldsToIds(this.models, this.newRecordData);

    return surveyEditor.create(convertedFields);
  }
}
