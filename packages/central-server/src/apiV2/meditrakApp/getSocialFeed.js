/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { respond } from '@tupaia/utils';
import { allowNoPermissions } from '../../permissions';

const DEFAULT_NUMBER_PER_PAGE = 20;

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

  respond(res, {
    pageNumber,
    hasMorePages,
    items,
  });
};
