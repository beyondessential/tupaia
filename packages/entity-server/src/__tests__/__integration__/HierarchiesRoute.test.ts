/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { TestableServer } from '@tupaia/server-boilerplate';

import { grantAccessToCountries, revokeCountryAccess, setupTestApp } from '../testUtilities';
import { COUNTRIES, getHierarchiesWithFields } from './fixtures';

describe('/hierarchies', () => {
  let app: TestableServer;

  beforeAll(async () => {
    app = await setupTestApp();
  });

  describe('data fetching', () => {
    beforeAll(async () => {
      grantAccessToCountries(COUNTRIES);
    });

    afterAll(async () => {
      revokeCountryAccess();
    });

    describe('field', () => {
      it('throws error for unknown field', async () => {
        const { body: error } = await app.get('hierarchies', {
          query: { field: 'fake_field' },
        });

        expect(error.error).toContain('Invalid single field requested fake_field');
      });

      it('can fetch hierarchies as single field', async () => {
        const { body: hierarchies } = await app.get('hierarchies', {
          query: { field: 'name' },
        });

        expect(hierarchies).toStrictEqual(['Pokemon Gold/Silver', 'Pokemon Red/Blue']);
      });
    });

    describe('fields', () => {
      it('throws error for unknown field', async () => {
        const { body: error } = await app.get('hierarchies', {
          query: { fields: 'fake_field' },
        });

        expect(error.error).toContain('Unknown field requested: fake_field');
      });

      it('can fetch hierarchies with specific fields', async () => {
        const { body: hierarchies } = await app.get('hierarchies', {
          query: { fields: 'code,name' },
        });

        expect(hierarchies).toBeArray();
        expect(hierarchies).toStrictEqual(
          getHierarchiesWithFields(['goldsilver', 'redblue'], ['code', 'name']),
        );
      });
    });
  });

  describe('permissions', () => {
    afterAll(async () => {
      revokeCountryAccess();
    });

    it('includes all hierarchies if user has access to them', async () => {
      grantAccessToCountries(COUNTRIES);
      const { body: hierarchies } = await app.get('hierarchies', {
        query: { fields: 'code,name' },
      });

      expect(hierarchies).toBeArray();
      expect(hierarchies).toStrictEqual(
        getHierarchiesWithFields(['goldsilver', 'redblue'], ['code', 'name']),
      );
    });

    it('filters hierarchies when requested for some with access', async () => {
      grantAccessToCountries(['JOHTO']);

      const { body: hierarchies } = await app.get('hierarchies', {
        query: { fields: 'code,name' },
      });

      expect(hierarchies).toBeArray();
      expect(hierarchies).toStrictEqual(getHierarchiesWithFields(['goldsilver'], ['code', 'name']));
    });
  });
});
