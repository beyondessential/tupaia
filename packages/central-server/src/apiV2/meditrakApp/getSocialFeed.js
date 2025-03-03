import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { respond } from '@tupaia/utils';
import { allowNoPermissions } from '../../permissions';

const DEFAULT_NUMBER_PER_PAGE = 20;

const USERS_EXCLUDED_FROM_LEADER_BOARD = [
  "'edmofro@gmail.com'", // Edwin
  "'kahlinda.mahoney@gmail.com'", // Kahlinda
  "'lparish1980@gmail.com'", // Lewis
  "'sus.lake@gmail.com'", // Susie
  "'michaelnunan@hotmail.com'", // Michael
  "'vanbeekandrew@gmail.com'", // Andrew
  "'gerardckelly@gmail.com'", // Gerry K
  "'geoffreyfisher@hotmail.com'", // Geoff F
  "'josh@sussol.net'", // mSupply API Client
  "'unicef.laos.edu@gmail.com'", // Laos Schools Data Collector
  "'tamanu-server@tupaia.org'", // Tamanu Server
  "'public@tupaia.org'", // Public User
];
const INTERNAL_EMAIL = ['@beyondessential.com.au', '@bes.au'];

// TODO: Remove as part of RN-502
export const getSocialFeed = async (req, res) => {
  const { query, models, accessPolicy } = req;
  const {
    countryId,
    earliestCreationDate = 0,
    page = 0,
    numberPerPage = DEFAULT_NUMBER_PER_PAGE,
  } = query;
  const pageNumber = Number.parseInt(page, 10);

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

  if (earliestCreationDate) {
    conditions.creation_date = {
      comparator: '>',
      comparisonValue: new Date(earliestCreationDate),
    };
  }

  const { items, hasMorePages } = await models.feedItem.findByAccessPolicy(
    accessPolicy,
    conditions,
    {
      pageLimit: numberPerPage,
      page,
    },
  );

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

// TODO: remove when we use the SurveyResponseModel fom database package
const getLeaderboard = async models => {
  return models.database.executeSql(
    ` SELECT r.user_id, user_account.first_name, user_account.last_name, r.coconuts, r.pigs
      FROM (
        SELECT user_id, COUNT(*)::int as coconuts, FLOOR(COUNT(*) / 100)::int as pigs
        FROM survey_response
        GROUP BY user_id
      ) r
      JOIN user_account on user_account.id = r.user_id
      WHERE ${INTERNAL_EMAIL.map(email => `email NOT LIKE '%${email}'`).join(' AND ')}
      AND email NOT IN (${USERS_EXCLUDED_FROM_LEADER_BOARD.join(',')})
      ORDER BY coconuts DESC
      LIMIT 10;
    `,
  );
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
