/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import { DatatrakWebActivityFeedRequest, Survey, FeedItemTypes, FeedItem } from '@tupaia/types';
import { QUERY_CONJUNCTIONS } from '@tupaia/database';

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
    const { query, models, ctx } = this.req;
    const { page: queryPage, projectId } = query;

    // get the user's surveys they have access to so that we can filter the feed items
    const userSurveys = await ctx.services.central.fetchResources('surveys', {
      columns: ['name'],
      pageSize: 'ALL',
      filter: { project_id: projectId },
    });

    const page = queryPage ? parseInt(queryPage, 10) : 0;

    // Fetch an extra record on page 0 to check to see if the page range exceeded the toDate.
    const limit = NUMBER_PER_PAGE + 1;

    // Filter to only feed items that are for the user's surveys or  markdown type feed items
    const conditions = {
      'template_variables->>surveyName': userSurveys.map((s: Survey) => s.name),
      [QUERY_CONJUNCTIONS.OR]: {
        type: FeedItemTypes.Markdown,
      },
    };

    const pinned = page === 0 ? await this.getPinnedItem() : undefined;

    // if there is a pinned item, exclude it from the rest of the feed items
    if (pinned) {
      conditions['id'] = {
        comparator: '<>',
        comparisonValue: pinned.id,
      };
    }

    const feedItems = await models.feedItem.find(conditions, {
      limit,
      offset: page * NUMBER_PER_PAGE,
      sort: ['creation_date DESC'],
    });
    const hasMorePages = feedItems.length > NUMBER_PER_PAGE;

    const items = (
      await Promise.all(feedItems.slice(0, NUMBER_PER_PAGE).map(f => f.getData()))
    ).map((feedItem: FeedItem) => ({
      ...feedItem,
      creation_date: new Date(feedItem.creation_date!).toJSON(),
    }));

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
