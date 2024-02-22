/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';
import { AccessPolicy } from '@tupaia/access-policy';
import { FeedItemTypes } from '@tupaia/types';
import { reduceToDictionary } from '@tupaia/utils';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';
import { JOIN_TYPES, QUERY_CONJUNCTIONS } from '../TupaiaDatabase';

export class FeedItemType extends DatabaseType {
  static databaseType = TYPES.FEED_ITEM;

  constructor(...args) {
    super(...args);
    // Reformat the creation_date string to include the timezone. By default Knex
    // parses the date as stored in the database with the server timezone then strips
    // out the timezone when producing a string for the creation date.
    this.creation_date = moment(this.creation_date).format('Y-MM-DD HH:mm:ss.SSSZZ');
  }
}

export class FeedItemModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return FeedItemType;
  }

  async createAccessPolicyQueryClause(accessPolicy) {
    const countryIdsByPermissionGroup = await this.getCountryIdsByPermissionGroup(accessPolicy);
    const params = Object.entries(countryIdsByPermissionGroup).flat().flat(); // e.g. ['Public', 'id1', 'id2', 'Admin', 'id3']

    return {
      sql: `(${Object.entries(countryIdsByPermissionGroup)
        .map(([_, countryIds]) => {
          return `
          (
            permission_group_id = ? AND 
            country_id IN (${countryIds.map(_ => `?`).join(',')})
          )
        `;
        })
        .join(' OR ')})`,
      parameters: params,
    };
  }

  async getCountryIdsByPermissionGroup(accessPolicy) {
    const permissionGroupNames = accessPolicy.getPermissionGroups();

    const countries = await this.otherModels.country.find({});

    const permissionGroups = await this.otherModels.permissionGroup.find({
      name: permissionGroupNames,
    });

    const countryIdByCode = reduceToDictionary(countries, 'code', 'id');

    const permissionGroupIdByName = reduceToDictionary(permissionGroups, 'name', 'id');
    return permissionGroupNames.reduce((result, permissionGroupName) => {
      const countryCodes = accessPolicy.getEntitiesAllowed(permissionGroupName);
      const permissionGroupId = permissionGroupIdByName[permissionGroupName];
      const countryIds = countryCodes.map(code => countryIdByCode[code]);
      return {
        ...result,
        [permissionGroupId]: countryIds,
      };
    }, {});
  }

  /**
   *
   * @param {AccessPolicy} accessPolicy
   * @param {object} customDbConditions
   * @param {object} dbOptions
   * @param {string[]} [dbOptions.sort]
   * @param {number} [dbOptions.pageLimit]
   * @param {number} [dbOptions.page]
   * @param {string} [dbOptions.joinWith]
   * @param {string[]} [dbOptions.joinCondition]
   * @param {string} [dbOptions.joinType]
   * @returns
   */
  async findByAccessPolicy(accessPolicy, customDbConditions = {}, dbOptions = {}) {
    const { sort = ['creation_date DESC'], pageLimit = 20, page = 0, ...options } = dbOptions;

    // get an extra item to see if there are more pages of results
    const limit = pageLimit + 1;
    const offset = page * pageLimit;

    const permissionsClause = await this.createAccessPolicyQueryClause(accessPolicy);

    const feedItems = await this.find(
      {
        ...customDbConditions,
        [QUERY_CONJUNCTIONS.AND]: {
          // also limit to the user's country-level permissions, because in some cases we filter the surveys by projectId
          [QUERY_CONJUNCTIONS.RAW]: permissionsClause,
          [QUERY_CONJUNCTIONS.OR]: {
            type: FeedItemTypes.Markdown,
          },
        },
      },
      {
        sort,
        limit,
        offset,
        columns: [`${TYPES.FEED_ITEM}.*`],
        ...options,
      },
    );

    const items = await Promise.all(feedItems.slice(0, pageLimit).map(item => item.getData()));

    const hasMorePages = feedItems.length > pageLimit;

    return {
      hasMorePages,
      items,
    };
  }
}
