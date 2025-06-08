import { Request } from 'express';
import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { Route } from '@tupaia/server-boilerplate';
import { NullableKeysToOptional, FeedItem } from '@tupaia/types';

const DEFAULT_NUMBER_PER_PAGE = 20;

type ResponseFeedItem = NullableKeysToOptional<
  Omit<FeedItem, 'creation_date' | 'updated_at_sync_tick'> & {
    creation_date?: string;
  }
>;

type SocialFeedResponse = {
  pageNumber: number;
  hasMorePages: boolean;
  items: ResponseFeedItem[];
};

type SocialFeedQuery = {
  countryId?: string;
  earliestCreationDate?: string;
  page?: string;
  numberPerPage?: string;
};

export type SocialFeedRequest = Request<
  Record<string, never>,
  SocialFeedResponse,
  Record<string, never>,
  SocialFeedQuery
>;

export class SocialFeedRoute extends Route<SocialFeedRequest> {
  private async getLeaderboardFeedItem() {
    const { models } = this.req;
    const leaderboard = await models.surveyResponse.getLeaderboard();

    return {
      id: 'leaderboard',
      type: 'leaderboard',
      country_id: 'all',
      creation_date: new Date().toJSON(),
      template_variables: {
        title: 'Tupaia Leaderboard',
        hasPigs: false, // this can be set to true if the meditrak-app table is fixed
        leaderboard,
      },
    };
  }

  /**
   * Adds dynamic feed items that aren't specified by the FeedItem model in-between
   * feed items. These feed items can be user specific and include profile information
   * where necessary.
   */
  private async intersperseDynamicFeedItems(feedItems: ResponseFeedItem[], page: number) {
    if (page === 0) {
      // Add leaderboard to third item in feed.
      const leaderboardItem = await this.getLeaderboardFeedItem();
      feedItems.splice(2, 0, leaderboardItem);
    }
  }

  public async buildResponse() {
    const { query, models } = this.req;
    const {
      countryId,
      earliestCreationDate,
      page: queryPage,
      numberPerPage: queryNumberPerPage,
    } = query;
    const pageNumber = queryPage ? parseInt(queryPage, 10) : 0;
    const numberPerPage = queryNumberPerPage
      ? parseInt(queryNumberPerPage, 10)
      : DEFAULT_NUMBER_PER_PAGE;

    // @todo: Use user access policy to determine the type of information appearing in the feed.
    const conditions: Record<string, any> = {};
    if (countryId) {
      // Include only feeds with the set country or an empty country.
      conditions.country_id = countryId;
      conditions[QUERY_CONJUNCTIONS.OR] = {
        country_id: {
          comparisonType: 'where',
          comparator: 'IS',
          comparisonValue: null,
        },
      };
    }

    // Fetch an extra record on page 0 to check to see if the page range exceeded the toDate.
    const limit = numberPerPage + 1;

    if (earliestCreationDate) {
      conditions.creation_date = {
        comparator: '>',
        comparisonValue: new Date(earliestCreationDate),
      };
    }

    const feedItems = await models.feedItem.find(conditions, {
      limit,
      offset: pageNumber * numberPerPage,
      sort: ['creation_date DESC'],
    });

    const hasMorePages = feedItems.length > numberPerPage;
    const items = (await Promise.all(feedItems.slice(0, numberPerPage).map(f => f.getData()))).map(
      item => ({
        ...item,
        creation_date: item.creation_date ? new Date(item.creation_date).toJSON() : undefined,
      }),
    );

    await this.intersperseDynamicFeedItems(items, pageNumber);

    return {
      pageNumber,
      hasMorePages,
      items,
    };
  }
}
