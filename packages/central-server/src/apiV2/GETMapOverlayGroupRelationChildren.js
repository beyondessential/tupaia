/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { BESAdminGETHandler } from './GETHandler';
import { generateLinkHeader } from './GETHandler/helpers';

export class GETMapOverlayGroupRelationChildren extends BESAdminGETHandler {
  permissionsFilteredInternally = true;

  async buildResponse() {
    const options = await this.getDbQueryOptions();

    // handle request for a single record
    // const { recordId } = this;
    // if (recordId) {
    //   const record = await this.findSingleRecord(recordId, options);
    //   return { body: record };
    // }

    // handle request for multiple records, including pagination headers

    const criteria = await this.getDbQueryCriteria();
    if (Object.keys(criteria).includes('childCode')) {
      criteria.code = criteria.childCode;
      delete criteria.childCode;
    }
    console.log('criteria', criteria);
    const mapOverlayRecords = await this.findRecords('map_overlay', criteria, options);
    const mapOverlayGroupRecords = await this.findRecords('map_overlay_group', criteria, options);
    console.log('map overlay records', mapOverlayRecords);
    console.log('map overlay records', mapOverlayGroupRecords);
    const pageOfRecords = mapOverlayRecords
      .map(o => {
        return { childId: o.id, childCode: o.code, childType: 'Map Overlay' };
      })
      .concat(
        mapOverlayGroupRecords
          .filter(o => o.code !== 'Root') // exclude Root group from children list
          .map(o => {
            return { childId: o.id, childCode: o.code, childType: 'Map Overlay Group' };
          }),
      );
    const totalNumberOfRecords =
      this.models.mapOverlay.count() + this.models.mapOverlayGroup.count();
    const { limit, page } = this.getPaginationParameters();
    const lastPage = Math.ceil(totalNumberOfRecords / limit);
    const linkHeader = generateLinkHeader(this.resource, page, lastPage, this.req.query);
    return {
      headers: {
        Link: linkHeader,
        'Access-Control-Expose-Headers': 'Link', // To get around CORS
      },
      body: pageOfRecords,
    };
  }

  async getDbQueryOptions() {
    const { distinct = false } = this.req.query;

    const { limit, page } = this.getPaginationParameters();
    const offset = limit * page;

    const dbQueryOptions = { distinct, limit, offset };

    return dbQueryOptions;
  }

  getDbQueryCriteria() {
    const { filter: filterString } = this.req.query;
    const filter = filterString ? JSON.parse(filterString) : {};
    return filter;
  }

  async findRecords(recordType, criteria, options) {
    if (!Object.keys(criteria)) {
      return this.database.find(recordType, criteria, options);
    }
    const targetedOptions = { ...options };
    targetedOptions.columns = [{ code: 'code' }, { id: 'id' }];
    targetedOptions.sort = ['code ASC'];

    return this.database.find(recordType, criteria, targetedOptions);
  }
}
