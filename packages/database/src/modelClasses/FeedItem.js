/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';
import { AccessPolicy } from '@tupaia/access-policy';
import { FeedItemTypes } from '@tupaia/types';
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

  /**
   *
   * @param {AccessPolicy} accessPolicy
   * @param {string} projectId
   * @param {object} conditions
   * @param {object} options
   * @param {string[]} [options.sort]
   * @param {number} [options.pageLimit]
   * @param {number} [options.page]
   * @returns
   */
  async findFeedItemsByAccessPolicy(accessPolicy, projectId = '', conditions = {}, options = {}) {
    const surveys = await this.otherModels.survey.findSurveysForAccessPolicy(
      accessPolicy,
      projectId,
    );

    const { sort = ['creation_date DESC'], pageLimit = 20, page = 0 } = options;

    // get an extra item to see if there are more pages of results
    const limit = pageLimit + 1;
    const offset = page * pageLimit;
    const surveyIds = surveys.map(survey => survey.id);

    const feedItems = await this.find(
      {
        'survey_response.survey_id': surveyIds,
        [QUERY_CONJUNCTIONS.OR]: {
          type: FeedItemTypes.Markdown,
        },
        ...conditions,
      },
      {
        sort,
        limit,
        offset,
        joinWith: TYPES.SURVEY_RESPONSE,
        joinCondition: [`${TYPES.FEED_ITEM}.record_id`, `${TYPES.SURVEY_RESPONSE}.id`],
        joinType: JOIN_TYPES.LEFT,
        columns: [`${TYPES.FEED_ITEM}.*`],
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
