/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import {
  assertSurveyScreenComponentPermissions,
  createSurveyScreenComponentDBFilter,
} from './assertSurveyScreenComponentPermissions';
import { allowNoPermissions, assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertSurveyPermissions } from '../GETSurveys/assertSurveyPermissions';

/**
 * Handles endpoints:
 * - /suveyScreenComponents
 * - /suveyScreenComponents/id
 * - /survey/id/suveyScreenComponents
 */

export class GETSurveyScreenComponents extends GETHandler {
  assertUserHasAccess() {
    return this.assertPermissions(allowNoPermissions);
  }

  async findSingleRecord(suveyScreenComponentId, options) {
    const suveyScreenComponent = await super.findSingleRecord(suveyScreenComponentId, options);

    const suveyScreenComponentChecker = accessPolicy =>
      assertSurveyScreenComponentPermissions(accessPolicy, this.models, suveyScreenComponentId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, suveyScreenComponentChecker]),
    );

    return suveyScreenComponent;
  }

  async findRecords(criteria, options) {
    if (this.parentRecordId) {
      return this.findRecordsViaParent(criteria, options);
    }

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
    const suveyChecker = accessPolicy =>
      assertSurveyPermissions(accessPolicy, this.models, this.parentRecordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, suveyChecker]));

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
