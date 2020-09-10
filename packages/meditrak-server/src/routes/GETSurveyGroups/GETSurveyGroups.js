/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { allowNoPermissions, assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertSurveyGroupPermissions,
  filterSurveyGroupsByPermissions,
} from './assertSurveyGroupsPermissions';
/**
 * Handles endpoints:
 * - /surveyGroup
 * - /surveyGroup/:surveyGroupId
 */
export class GETSurveyGroups extends GETHandler {
  async assertUserHasAccess() {
    return this.assertPermissions(allowNoPermissions);
  }

  async findSingleRecord(surveyGroupId, options) {
    const surveyGroup = await super.findSingleRecord(surveyGroupId, options);

    const surveyGroupChecker = accessPolicy =>
      assertSurveyGroupPermissions(accessPolicy, this.models, [surveyGroup]);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, surveyGroupChecker]));

    return surveyGroup;
  }

  async findRecords(criteria, options) {
    const surveyGroups = await this.database.find(this.recordType, criteria, options);

    return filterSurveyGroupsByPermissions(this.accessPolicy, this.models, surveyGroups);
  }
}
