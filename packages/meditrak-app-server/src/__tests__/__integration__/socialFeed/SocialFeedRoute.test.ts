// eslint-disable-next-line import/no-extraneous-dependencies
import MockDate from 'mockdate';
import { constructAccessToken } from '@tupaia/auth';
import {
  findOrCreateDummyRecord,
  findOrCreateDummyCountryEntity,
  getTestModels,
  clearTestData,
  getTestDatabase,
} from '@tupaia/database';
import { TestableServer } from '@tupaia/server-boilerplate';
import { createBearerHeader } from '@tupaia/utils';
import { TestModelRegistry } from '../../types';
import { grantUserAccess, revokeAccess, setupTestApp, setupTestUser } from '../../utilities';
import {
  addLeaderboardAsThirdItem,
  filterItemFields,
  replaceItemsCountryWithCountryId,
} from './helper';
import { COUNTRIES, CURRENT_SYNC_TICK, FEED_ITEMS, GONDOR } from './SocialFeedRoute.fixtures';

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
  let authHeader: string;

  beforeAll(async () => {
    MockDate.set(CURRENT_DATE_STUB);
    const models = getTestModels() as TestModelRegistry;

    await findOrCreateDummyRecord(
      models.localSystemFact,
      { key: 'currentSyncTick' },
      { value: CURRENT_SYNC_TICK },
    );
    
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
    const user = await setupTestUser();
    authHeader = createBearerHeader(
      constructAccessToken({
        userId: user.id,
        apiClientUserId: undefined,
      }),
    );
    grantUserAccess(user.id);
  });

  afterAll(async () => {
    MockDate.reset();
    revokeAccess();
    await clearTestData(getTestDatabase());
  });

  describe('/socialFeed', () => {
    it('it returns 500 if no auth header provided', async () => {
      const response = await app.get('socialFeed');

      expect(response.statusCode).toBe(500);
      expect(response.body.error).toMatch(/.*Authorization header required.*/);
    });

    it('it returns the social feed with the leaderboard', async () => {
      const response = await app.get('socialFeed', {
        headers: {
          Authorization: authHeader,
        },
      });

      const { hasMorePages, items, pageNumber } = response.body;

      expect(hasMorePages).toBe(false);
      expect(pageNumber).toBe(0);
      const expectedItems = replaceItemsCountryWithCountryId(FEED_ITEMS, countryCodeToId);

      addLeaderboardAsThirdItem(expectedItems, LEADERBOARD_ITEM);
      expect(filterItemFields(items)).toEqual(expectedItems);
    });

    it('it filters by countryId', async () => {
      const response = await app.get('socialFeed', {
        headers: {
          Authorization: authHeader,
        },
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
        headers: {
          Authorization: authHeader,
        },
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
        headers: {
          Authorization: authHeader,
        },
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
        headers: {
          Authorization: authHeader,
        },
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
