/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { allowNoPermissions } from '../../permissions';
import { GETHandler } from '../GETHandler';

/**
 * Custom implementation required for this route as there is no corresponding DatabaseModel for EntityType
 * (it's an enum not a table)
 */
export class GetEntityTypes extends GETHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(allowNoPermissions);
  }

  async getEntityTypes() {
    return this.models.entity.getEntityTypes();
  }

  async getDbQueryOptions() {
    const { limit, page } = this.getPaginationParameters();
    const offset = limit * page;

    return { limit, offset };
  }

  async findSingleRecord(recordId) {
    const entityTypes = await this.getEntityTypes();
    const entityType = entityTypes.find(type => type === recordId);
    if (!entityType) {
      return undefined;
    }

    return { id: entityType, type: entityType };
  }

  async findRecords(criteria, options) {
    const { limit, offset } = options;
    const entityTypes = await this.getEntityTypes();
    if (offset) {
      entityTypes.splice(0, offset);
    }
    if (limit) {
      entityTypes.splice(limit);
    }
    return entityTypes.map(type => ({ id: type, type }));
  }

  async countRecords() {
    const entityTypes = await this.getEntityTypes();
    return entityTypes.length;
  }
}
