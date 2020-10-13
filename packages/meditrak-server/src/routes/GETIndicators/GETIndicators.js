/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { allowNoPermissions, assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertIndicatorsPermissions,
  filterIndicatorsByPermissions,
} from './assertIndicatorsPermissions';
/**
 * Handles endpoints:
 * - /indicator
 * - /indicator/:indicatorId
 */
export class GETIndicators extends GETHandler {
  async assertUserHasAccess() {
    return true; // all users can request, but results will be filtered according to access
  }

  async findSingleRecord(indicatorId, options) {
    const indicator = await super.findSingleRecord(indicatorId, options);

    const indicatorChecker = accessPolicy =>
      assertIndicatorsPermissions(accessPolicy, this.models, [indicator]);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, indicatorChecker]));

    return indicator;
  }

  async findRecords(criteria, options) {
    // ensure the permissions gate check is triggered, actual permissions will be assessed during filtering
    this.assertPermissions(allowNoPermissions);
    const indicators = await this.database.find(this.recordType, criteria, options);
    return filterIndicatorsByPermissions(this.accessPolicy, this.models, indicators);
  }
}
