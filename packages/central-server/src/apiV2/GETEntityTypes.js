/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from './GETHandler';
import { hasBESAdminAccess } from '../permissions';
import { generateLinkHeader } from './GETHandler/helpers';

const createEntityTypesDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }

  const dbConditions = { ...criteria };

  return dbConditions;
};

export class GETEntityTypes extends GETHandler {
  permissionsFilteredInternally = true;

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createEntityTypesDBFilter(this.accessPolicy, this.models, criteria);
    return { dbConditions, dbOptions: options };
  }

  async buildResponse() {
    let options = await this.getDbQueryOptions();
    let criteria = this.getDbQueryCriteria();
    if (this.permissionsFilteredInternally) {
      ({ dbConditions: criteria, dbOptions: options } = await this.applyPermissionsFilter(
        criteria,
        options,
      ));
    }
    const { types } = this.models.entity;
    const entityTypes = Object.values(types)
      .filter(value => value !== 'world')
      .map(value => {
        return { entityType: value };
      });
    const totalNumberOfRecords = entityTypes.length;
    const { limit, page } = this.getPaginationParameters();
    const lastPage = Math.ceil(totalNumberOfRecords / limit);
    const linkHeader = generateLinkHeader(this.resource, page, lastPage, this.req.query);
    return {
      headers: {
        Link: linkHeader,
        'Access-Control-Expose-Headers': 'Link', // To get around CORS
      },
      body: entityTypes,
    };
  }
}
