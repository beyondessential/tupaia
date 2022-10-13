/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { addBaselineTestCountries, buildAndInsertProjectsAndHierarchies } from '@tupaia/database';
import { BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import { TestableApp, setupMapOverlayTestData } from '../testUtilities';

describe('GETMapOverlayGroupRelationChildren', async () => {
  const BES_ADMIN_POLICY = {
    LA: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();

  const { models } = app;

  before(async () => {
    // Still create these existing entities just in case test database for some reasons do not have these records.
    await addBaselineTestCountries(models);

    await buildAndInsertProjectsAndHierarchies(models, [
      {
        code: 'test_project',
        name: 'Test Project',
        entities: [{ code: 'KI' }, { code: 'VU' }, { code: 'TO' }, { code: 'SB' }],
      },
    ]);

    // Set up the map overlays
    await setupMapOverlayTestData(models);
  });

  afterEach(() => {
    app.revokeAccess();
  });

  it('is an array with the right keys in each object', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const { body: result } = await app.get('mapOverlayGroupRelationChildren/');

    expect(result).to.be.an('array');
    expect(result[0]).to.have.all.keys('childId', 'childCode', 'childType');
  });

  it('it returns 0 results when no codes match search criteria', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const searchTerm = 'covid';
    const { body: result } = await app.get(
      `mapOverlayGroupRelationChildren?filter=%7B%22childCode%22%3A%7B%22comparator%22%3A%22ilike%22%2C%22comparisonValue%22%3A%22%25${searchTerm}%25%22%2C%22castAs%22%3A%22text%22%7D%7D&pageSize=10&sort=%5B%22childCode%20ASC%22%5D&columns=%5B%22childCode%22%2C%22childId%22%5D&distinct=true`,
    );

    expect(result).to.be.an('array');
    expect(result).to.have.lengthOf(0);
  });

  it('it returns some results when no codes match search criteria', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const searchTerm = 'national';
    const { body: result } = await app.get(
      `mapOverlayGroupRelationChildren?filter=%7B%22childCode%22%3A%7B%22comparator%22%3A%22ilike%22%2C%22comparisonValue%22%3A%22%25${searchTerm}%25%22%2C%22castAs%22%3A%22text%22%7D%7D&pageSize=10&sort=%5B%22childCode%20ASC%22%5D&columns=%5B%22childCode%22%2C%22childId%22%5D&distinct=true`,
    );

    expect(result).to.be.an('array');
    expect(result).to.have.lengthOf(2);
  });
});
