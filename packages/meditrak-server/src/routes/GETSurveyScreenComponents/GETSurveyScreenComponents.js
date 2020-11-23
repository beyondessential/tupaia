/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import {
  assertSurveyScreenComponentPermissions,
  createSurveyScreenComponentDBFilter,
} from './assertSurveyScreenComponentPermissions';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertSurveyPermissions } from '../GETSurveys/assertSurveyPermissions';

/**
 * Handles endpoints:
 * - /surveyScreenComponents
 * - /surveyScreenComponents/id
 * - /survey/id/surveyScreenComponents
 */

export class GETSurveyScreenComponents extends GETHandler {
  async findSingleRecord(surveyScreenComponentId, options) {
    const surveyScreenComponent = await super.findSingleRecord(surveyScreenComponentId, options);

    const surveyScreenComponentChecker = accessPolicy =>
      assertSurveyScreenComponentPermissions(accessPolicy, this.models, surveyScreenComponentId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyScreenComponentChecker]),
    );

    return surveyScreenComponent;
  }

  async findRecords(criteria, options) {
    const { dbConditions, dbOptions } = await createSurveyScreenComponentDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
      options,
    );

    return super.findRecords(dbConditions, dbOptions);
  }

  async findRecordsViaParent(criteria, options) {
    // Check parent permissions
    const surveyPermissionsChecker = accessPolicy =>
      assertSurveyPermissions(accessPolicy, this.models, this.parentRecordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyPermissionsChecker]),
    );

    const { dbConditions, dbOptions } = await createSurveyScreenComponentDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
      options,
      this.parentRecordId,
    );

    return super.findRecords(dbConditions, dbOptions);
  }
}
