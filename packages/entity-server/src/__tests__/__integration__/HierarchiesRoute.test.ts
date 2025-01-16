import { TestableServer } from '@tupaia/server-boilerplate';

import { grantAccessToCountries, revokeCountryAccess, setupTestApp } from '../testUtilities';
import { COUNTRIES, getHierarchiesWithFields } from './fixtures';

describe('/hierarchies', () => {
  let app: TestableServer;

  beforeAll(async () => {
    app = await setupTestApp();
    grantAccessToCountries(COUNTRIES);
  });

  afterAll(async () => {
    revokeCountryAccess();
  });

  describe('/hierarchies', () => {
    it('can fetch hierarchies', async () => {
      const { body: hierarchies } = await app.get('hierarchies', {
        query: { fields: 'code,name' },
      });

      expect(hierarchies).toBeArray();
      expect(hierarchies).toIncludeSameMembers(
        getHierarchiesWithFields(['goldsilver', 'redblue'], ['code', 'name']),
      );
    });
  });
});
