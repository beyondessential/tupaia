/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import MockDate from 'mockdate';

import {
  findOrCreateDummyRecord,
  findOrCreateDummyCountryEntity,
  getTestModels,
  clearTestData,
  getTestDatabase,
} from '@tupaia/database';
import { TestableServer } from '@tupaia/server-boilerplate';
import { TestModelRegistry } from '../../types';
import { setupTestApp } from '../../utilities';
import {
  addLeaderboardAsThirdItem,
  filterItemFields,
  replaceItemsCountryWithCountryId,
} from './helper';
import { COUNTRIES, FEED_ITEMS, GONDOR } from './SocialFeedRoute.fixtures';

describe('socialFeed', () => {
  const CURRENT_DATE_STUB = '2020-12-15T00:00:00.000Z';

  const LEADERBOARD_ITEM = {
    country_id: 'all',
    creation_date: CURRENT_DATE_STUB,
    template_variables: {
      hasPigs: false,
      leaderboard: [],
      title: 'Tupaia Leaderboard',
    },
    type: 'leaderboard',
  };

  const countryCodeToId: Record<string, string> = {};

  let app: TestableServer;

  beforeAll(async () => {
    MockDate.set(CURRENT_DATE_STUB);
    const models = getTestModels() as TestModelRegistry;

    const insertedCountries = await Promise.all(
      COUNTRIES.map(async country => {
        return findOrCreateDummyCountryEntity(models, country);
      }),
    );

    insertedCountries.forEach(({ country }) => {
      countryCodeToId[country.code] = country.id;
    });

    const databaseTimezone = await models.database.getTimezone();
    const timezoneConvertedFeedItems = FEED_ITEMS.map(feedItem => ({
      ...feedItem,
      creation_date: new Date(feedItem.creation_date).toLocaleString(databaseTimezone), // Adjust for timezone so tests work regardless of db timezone
    }));

    const feedItemsToInsert = replaceItemsCountryWithCountryId(
      timezoneConvertedFeedItems,
      countryCodeToId,
    );
    await Promise.all(
      feedItemsToInsert.map(async feedItem => {
        await findOrCreateDummyRecord(models.feedItem, feedItem, {});
      }),
    );

    app = await setupTestApp();
  });

  afterAll(async () => {
    MockDate.reset();
    await clearTestData(getTestDatabase());
  });

  describe('/socialFeed', () => {
    it('it returns the social feed with the leaderboard', async () => {
      const response = await app.get('socialFeed');

      const { hasMorePages, items, pageNumber } = response.body;

      expect(hasMorePages).toBe(false);
      expect(pageNumber).toBe(0);
      const expectedItems = replaceItemsCountryWithCountryId(FEED_ITEMS, countryCodeToId);
      addLeaderboardAsThirdItem(expectedItems, LEADERBOARD_ITEM);
      expect(filterItemFields(items)).toEqual(expectedItems);
    });

    it('it filters by countryId', async () => {
      const response = await app.get('socialFeed', {
        query: { countryId: countryCodeToId[GONDOR.code] },
      });

      const { hasMorePages, items, pageNumber } = response.body;

      expect(hasMorePages).toBe(false);
      expect(pageNumber).toBe(0);
      const expectedItems = replaceItemsCountryWithCountryId(
        FEED_ITEMS.filter(item => !item.country || item.country === GONDOR.code),
        countryCodeToId,
      );
      addLeaderboardAsThirdItem(expectedItems, LEADERBOARD_ITEM);
      expect(filterItemFields(items)).toEqual(expectedItems);
    });

    it('it filters by earliestCreationDate', async () => {
      const earliestCreationDate = '2020-01-02';
      const response = await app.get('socialFeed', {
        query: { earliestCreationDate },
      });

      const { hasMorePages, items, pageNumber } = response.body;

      expect(hasMorePages).toBe(false);
      expect(pageNumber).toBe(0);
      const expectedItems = replaceItemsCountryWithCountryId(
        FEED_ITEMS.filter(item => new Date(item.creation_date) > new Date(earliestCreationDate)),
        countryCodeToId,
      );
      addLeaderboardAsThirdItem(expectedItems, LEADERBOARD_ITEM);
      expect(filterItemFields(items)).toEqual(expectedItems);
    });

    it('it can paginate', async () => {
      const firstPageResponse = await app.get('socialFeed', {
        query: { page: 0, numberPerPage: 2 },
      });

      const {
        hasMorePages: firstPageHasMorePages,
        items: firstPageItems,
        pageNumber: firstPagePageNumber,
      } = firstPageResponse.body;

      expect(firstPageHasMorePages).toBe(true);
      expect(firstPagePageNumber).toBe(0);
      const firstPageExpectedItems = replaceItemsCountryWithCountryId(
        FEED_ITEMS.filter((_, index) => index < 2),
        countryCodeToId,
      );
      addLeaderboardAsThirdItem(firstPageExpectedItems, LEADERBOARD_ITEM);
      expect(filterItemFields(firstPageItems)).toEqual(firstPageExpectedItems);

      const secondPageResponse = await app.get('socialFeed', {
        query: { page: 1, numberPerPage: 2 },
      });

      const {
        hasMorePages: secondPageHasMorePages,
        items: secondPageItems,
        pageNumber: secondPagePageNumber,
      } = secondPageResponse.body;

      expect(secondPageHasMorePages).toBe(false);
      expect(secondPagePageNumber).toBe(1);
      const secondPageExpectedItems = replaceItemsCountryWithCountryId(
        FEED_ITEMS.filter((_, index) => index >= 2),
        countryCodeToId,
      );
      expect(filterItemFields(secondPageItems)).toEqual(secondPageExpectedItems);
    });
  });
});
