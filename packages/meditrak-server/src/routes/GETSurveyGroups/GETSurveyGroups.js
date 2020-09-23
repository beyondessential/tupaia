/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { allowNoPermissions, assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertSurveyGroupsPermissions,
  filterSurveyGroupsByPermissions,
} from './assertSurveyGroupsPermissions';
/**
 * Handles endpoints:
 * - /surveyGroup
 * - /surveyGroup/:surveyGroupId
 */
export class GETSurveyGroups extends GETHandler {
  async assertUserHasAccess() {
    return true; // all users can request, but results will be filtered according to access
  }

  async findSingleRecord(surveyGroupId, options) {
    const surveyGroup = await super.findSingleRecord(surveyGroupId, options);

    const surveyGroupChecker = accessPolicy =>
      assertSurveyGroupsPermissions(accessPolicy, this.models, [surveyGroup]);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, surveyGroupChecker]));

    return surveyGroup;
  }

  async findRecords(criteria, options) {
    // ensure the permissions gate check is triggered, actual permissions will be assessed during filtering
    this.assertPermissions(allowNoPermissions);
    const surveyGroups = await this.database.find(this.recordType, criteria, options);
    return filterSurveyGroupsByPermissions(this.accessPolicy, this.models, surveyGroups);
  }
}
