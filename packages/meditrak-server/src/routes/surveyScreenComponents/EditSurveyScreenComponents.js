/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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
    await this.updateRecord();
  }
}
