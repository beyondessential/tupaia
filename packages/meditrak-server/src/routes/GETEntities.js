/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from './GETHandler';
import { assertAnyPermissions, assertBESAdminAccess, hasBESAdminAccess } from '../permissions';
import { mergeFilter } from './utilities';

export const assertEntityPermissions = async (accessPolicy, models, entityId) => {
  const entity = await models.entity.findById(entityId);
  if (!entity) {
    throw new Error(`No entity exists with id ${entityId}`);
  }
  if (!accessPolicy.allows(entity.country_code)) {
    throw new Error('You do not have permissions for this entity');
  }
  return true;
};

export class GETEntities extends GETHandler {
  permissionsFilteredInternally = true;

  async findSingleRecord(entityId, options) {
    const entityPermissionChecker = accessPolicy =>
      assertEntityPermissions(accessPolicy, this.models, entityId);
    this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, entityPermissionChecker]));

    return super.findSingleRecord(entityId, options);
  }

  async findRecords(criteria, options) {
    const dbConditions = { ...criteria };

    if (!hasBESAdminAccess(this.accessPolicy)) {
      dbConditions['entity.country_code'] = mergeFilter(
        this.accessPolicy.getEntitiesAllowed(),
        dbConditions['entity.country_code'],
      );
    }

    return super.findRecords(dbConditions, options);
  }

  async findRecordsViaParent(criteria, options) {
    // TODO: Split this out to GETCountries file with #1129
    const country = await this.models.country.findById(this.parentRecordId);
    if (!hasBESAdminAccess(this.accessPolicy) && !this.accessPolicy.allows(country.code)) {
      throw new Error('You do not have permission for this country');
    }
    const dbConditions = { 'entity.country_code': country.code, ...criteria };

    return super.findRecords(dbConditions, options);
  }
}
