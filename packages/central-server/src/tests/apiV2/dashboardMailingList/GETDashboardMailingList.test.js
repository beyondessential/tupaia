/**
 * Tupaia
 * Copyright (c) 2023 - 2026 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { setupMailingList } from './setupMailingList';
import { TestableApp } from '../../testUtilities';

const getFilterString = filter => `filter=${JSON.stringify(filter)}`;

describe('GET /dashboardMailingList', async () => {
  const DEFAULT_POLICY = {
    DL: ['Testing'],
  };

  const HIGHER_POLICY = {
    DL: ['Other'],
  };

  const app = new TestableApp();
  const { models } = app;

  // Declare variable in upper scope to use in test functions
  let dashboardMailingListItem1;

  before(async () => {
    // Set up test mailing list records in the database and return dashboardMailingList item
    dashboardMailingListItem1 = await setupMailingList(models);
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /dashboardMailingList/', async () => {
    it('returns all mailing list records with dashboards user has permission to', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`dashboardMailingList/`);
      expect(results.length).to.equal(2);
    });

    it('returns mailing list for a given email address', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const filter = {
        email: { comparator: 'in', comparisonValue: [dashboardMailingListItem1.email] },
      };
      const filterString = getFilterString(filter);
      const { body: results } = await app.get(`dashboardMailingList?${filterString}`);
      expect(results.length).to.equal(1);
    });

    it('returns all mailing list records with higher permissions', async () => {
      await app.grantAccess(HIGHER_POLICY);
      const { body: results } = await app.get(`dashboardMailingList/`);
      expect(results.length).to.equal(3);
    });
  });
});
