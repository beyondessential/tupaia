/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import {
  assertSurveyResponsePermissions,
  createSurveyResponseDBFilter,
} from './assertSurveyResponsePermissions';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertTupaiaAdminPanelAccess,
} from '../../permissions';
import { assertEntityPermissions } from '../GETEntities';

/**
 * Handles endpoints:
 * - /surveyResponses
 * - /surveyResponses/:surveyResponseId
 */
export class GETSurveyResponses extends GETHandler {
  permissionsFilteredInternally = true;

  async findSingleRecord(surveyResponseId, options) {
    const surveyResponse = await super.findSingleRecord(surveyResponseId, options);

    const surveyResponseChecker = accessPolicy =>
      assertSurveyResponsePermissions(accessPolicy, this.models, surveyResponseId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyResponseChecker]),
    );

    return surveyResponse;
  }

  async findRecords(criteria, options) {
    const { dbConditions, dbOptions } = await createSurveyResponseDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
      options,
    );
    const surveyResponses = await super.findRecords(dbConditions, dbOptions);

    return surveyResponses;
  }

  async findRecordsViaParent(criteria, options) {
    const entityPermissionChecker = accessPolicy =>
      assertEntityPermissions(accessPolicy, this.models, this.parentRecordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, entityPermissionChecker]),
    );
    const dbConditions = { 'survey_response.entity_id': this.parentRecordId, ...criteria };

    return this.findRecords(dbConditions, options);
  }
}
