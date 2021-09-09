/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertSurveyEditPermissions } from './assertSurveyPermissions';
import { editSurvey } from '../../dataAccessors';

export class EditSurveys extends EditHandler {
  async assertUserHasAccess() {
    const surveyChecker = accessPolicy =>
      assertSurveyEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, surveyChecker]));
  }

  async editRecord() {
    return editSurvey(this.models, this.recordId, this.updatedFields);
  }
}
