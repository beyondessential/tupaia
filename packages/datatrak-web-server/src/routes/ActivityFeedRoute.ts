/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebActivityFeedRequest, FeedItemTypes } from '@tupaia/types';
import { JOIN_TYPES, TYPES } from '@tupaia/database';

export type ActivityFeedRequest = Request<
  DatatrakWebActivityFeedRequest.Params,
  DatatrakWebActivityFeedRequest.ResBody,
  DatatrakWebActivityFeedRequest.ReqBody,
  DatatrakWebActivityFeedRequest.ReqQuery
>;

const NUMBER_PER_PAGE = 20;

const getPreviousMonth = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d;
};

export class ActivityFeedRoute extends Route<ActivityFeedRequest> {
  private async getPinnedItem(): Promise<DatatrakWebActivityFeedRequest.ResBody['pinned']> {
    const { models } = this.req;
    const oneMonthAgo = getPreviousMonth();
    // get the first available markdown item from the last month
    const firstAvailableMarkdownItem = await models.feedItem.findOne(
      {
        type: FeedItemTypes.Markdown,
        creation_date: {
          comparator: '>=',
          comparisonValue: oneMonthAgo,
        },
      },
      {
        sort: ['creation_date DESC'],
      },
    );
    // if there is a markdown item, return it
    if (firstAvailableMarkdownItem) {
      return firstAvailableMarkdownItem.getData() as Promise<
        DatatrakWebActivityFeedRequest.ResBody['pinned']
      >;
    }
    return undefined;
  }

  public async buildResponse() {
    const { query, models, accessPolicy } = this.req;
    const { page: queryPage, projectId } = query;

    const page = queryPage ? parseInt(queryPage, 10) : 0;

    const pinned = page === 0 ? await this.getPinnedItem() : undefined;

    const surveys = await models.survey.find({
      project_id: projectId,
    });
    const conditions = {
      'survey_response.survey_id': {
        comparator: 'IN',
        comparisonValue: surveys.map(s => s.id),
      },
    } as Record<string, unknown>;

    // if there is a pinned item, exclude it from the rest of the feed items
    if (pinned) {
      conditions['feed_item.id'] = {
        comparator: '<>',
        comparisonValue: pinned.id,
      };
    }

    const { items, hasMorePages } = await models.feedItem.findByAccessPolicy(
      accessPolicy,
      conditions,
      {
        page,
        pageLimit: NUMBER_PER_PAGE,
        joinWith: TYPES.SURVEY_RESPONSE,
        joinCondition: [`${TYPES.FEED_ITEM}.record_id`, `${TYPES.SURVEY_RESPONSE}.id`],
        joinType: JOIN_TYPES.LEFT,
      },
    );

    return camelcaseKeys(
      {
        pageNumber: page,
        hasMorePages,
        items,
        pinned,
      },
      {
        deep: true,
      },
    );
  }
}
