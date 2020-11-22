/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { allowNoPermissions, assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertSurveyGroupsPermissions,
  createSurveyGroupDBFilter,
} from './assertSurveyGroupsPermissions';
/**
 * Handles endpoints:
 * - /surveyGroups
 * - /surveyGroups/:surveyGroupId
 */
export class GETSurveyGroups extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(allowNoPermissions); // all users can request, but results will be filtered according to access
  }

  async findSingleRecord(surveyGroupId, options) {
    const surveyGroup = await super.findSingleRecord(surveyGroupId, options);

    const surveyGroupChecker = accessPolicy =>
      assertSurveyGroupsPermissions(accessPolicy, this.models, surveyGroupId);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, surveyGroupChecker]));

    return surveyGroup;
  }

  async findRecords(criteria, options) {
    const dbConditions = await createSurveyGroupDBFilter(this.accessPolicy, this.models, criteria);
    const userAccounts = await super.findRecords(dbConditions, options);

    return userAccounts;
  }
}
