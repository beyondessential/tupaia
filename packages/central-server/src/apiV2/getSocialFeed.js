/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { respond } from '@tupaia/utils';
import { getLeaderboard } from '../social';
import { allowNoPermissions } from '../permissions';

const DEFAULT_NUMBER_PER_PAGE = 20;

// TODO: Remove as part of RN-502
export const getSocialFeed = async (req, res) => {
  const { query, models } = req;
  const {
    countryId,
    earliestCreationDate = 0,
    page = 0,
    numberPerPage = DEFAULT_NUMBER_PER_PAGE,
  } = query;
  const pageNumber = parseInt(page, 10);

  await req.assertPermissions(allowNoPermissions);

  // @todo: Use user access policy to determine the type of information appearing in the feed.
  const conditions = {};
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
  const items = await Promise.all(feedItems.slice(0, numberPerPage - 1).map(f => f.getData()));

  await intersperseDynamicFeedItems(items, countryId, pageNumber, models);

  respond(res, {
    pageNumber,
    hasMorePages,
    items,
  });
};

/**
 * Adds dynamic feed items that aren't specified by the FeedItem model in-between
 * feed items. These feed items can be user specific and include profile information
 * where necessary.
 *
 * @param {array} feedItems Current set of feed items.
 * @param {string} countryId Current country ID for the feed.
 * @param {number} page Current page number.
 * @param {object} req Page request
 *
 * @returns {array} New set of feed items.
 */
const intersperseDynamicFeedItems = async (feedItems, countryId, page, models) => {
  if (page === 0) {
    // Add leaderboard to second item in feed.
    const leaderboardItem = await getLeaderboardFeedItem(models);
    feedItems.splice(2, 0, leaderboardItem);
  }
};

const getLeaderboardFeedItem = async models => {
  const leaderboard = await getLeaderboard(models);

  return {
    id: 'leaderboard',
    type: 'leaderboard',
    country_id: 'all',
    creation_date: new Date(),
    template_variables: {
      title: 'Tupaia Leaderboard',
      hasPigs: false, // this can be set to true if the meditrak-app table is fixed
      leaderboard,
    },
  };
};
