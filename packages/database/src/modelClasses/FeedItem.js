/**
 * @typedef {import('@tupaia/types').Country} Country
 * @typedef {import('@tupaia/types').PermissionGroup} PermissionGroup
 */

import moment from 'moment';

import { AccessPolicy } from '@tupaia/access-policy';
import { FeedItemTypes } from '@tupaia/types';
import { reduceToDictionary } from '@tupaia/utils';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { SqlQuery } from '../SqlQuery';
import { QUERY_CONJUNCTIONS } from '../TupaiaDatabase';

export const FEED_ITEM_TYPES = ['SurveyResponse', 'markdown'];

export class FeedItemRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.FEED_ITEM;

  constructor(...args) {
    super(...args);
    // Reformat the creation_date string to include the timezone. By default Knex
    // parses the date as stored in the database with the server timezone then strips
    // out the timezone when producing a string for the creation date.
    this.creation_date = moment(this.creation_date).format('Y-MM-DD HH:mm:ss.SSSZZ');
  }
}

export class FeedItemModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return FeedItemRecord;
  }

  /** @param {AccessPolicy} accessPolicy */
  async createAccessPolicyQueryClause(accessPolicy) {
    /** @type {Record<PermissionGroup["name"], Country["id"][]>} */
    const countryIdsByPermissionGroup = await this.getCountryIdsByPermissionGroup(accessPolicy);
    const entries = Object.entries(countryIdsByPermissionGroup);
    const clause = entries
      .map(([, countryIds]) => {
        return `(feed_item.permission_group_id = ? AND feed_item.country_id IN ${SqlQuery.record(countryIds)})`;
      })
      .join(' OR ');
    return {
      // Add markdown type to query so that it always gets wrapped in brackets with the permissions
      sql: `(${clause} OR feed_item.type = '${FeedItemTypes.Markdown}')`,
      parameters: entries.flat(2), // e.g. ['Public', 'id1', 'id2', 'Admin', 'id3']
    };
  }

  /**
   * @param {AccessPolicy} accessPolicy
   * @privateRemarks Identical to `SurveyModel.getCountryIdsByPermissionGroup`
   */
  async getCountryIdsByPermissionGroup(accessPolicy) {
    const permissionGroupNames = accessPolicy.getPermissionGroups();
    const [countries, permissionGroups] = await Promise.all([
      this.otherModels.country.all(),
      this.otherModels.permissionGroup.find({ name: permissionGroupNames }),
    ]);

    const countryIdByCode = reduceToDictionary(countries, 'code', 'id');

    const permissionGroupIdByName = reduceToDictionary(permissionGroups, 'name', 'id');
    return permissionGroupNames.reduce((result, permissionGroupName) => {
      const countryCodes = accessPolicy.getEntitiesAllowed(permissionGroupName);
      const permissionGroupId = permissionGroupIdByName[permissionGroupName];
      const countryIds = countryCodes.map(code => countryIdByCode[code]);
      result[permissionGroupId] = countryIds;
      return result;
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
        // also limit to the user's country-level permissions, because in some cases we filter the surveys by projectId
        [QUERY_CONJUNCTIONS.RAW]: permissionsClause,
      },
      {
        sort,
        limit,
        offset,
        columns: [`${RECORDS.FEED_ITEM}.*`],
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
