/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import {
  assertSurveyResponsePermissions,
  createSurveyResponseDBFilter,
} from './assertSurveyResponsePermissions';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
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

  async getPermissionsFilter(criteria, options) {
    return createSurveyResponseDBFilter(this.accessPolicy, this.models, criteria, options);
  }

  async getPermissionsViaParentFilter(criteria, options) {
    const entityPermissionChecker = accessPolicy =>
      assertEntityPermissions(accessPolicy, this.models, this.parentRecordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, entityPermissionChecker]),
    );
    // Filter by parent
    const dbConditions = { 'survey_response.entity_id': this.parentRecordId, ...criteria };

    // Apply regular permissions
    return this.getPermissionsFilter(dbConditions, options);
  }
}
