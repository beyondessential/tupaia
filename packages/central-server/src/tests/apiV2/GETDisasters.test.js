/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { findOrCreateDummyRecord } from '@tupaia/database';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import { TestableApp } from '../testUtilities';

const getFilterString = filter => `filter=${JSON.stringify(filter)}`;

describe('Permissions checker for GETDisasters', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
    VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    LA: ['Admin'],
  };

  const BES_ADMIN_POLICY = {
    SB: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;
  let disaster1;
  let disaster2;
  let disaster3;
  let filter;
  let filterString;

  before(async () => {
    // Set up test disasters in the database
    disaster1 = await findOrCreateDummyRecord(models.disaster, {
      name: 'Test disaster 1',
      countryCode: 'VU',
    });
    disaster2 = await findOrCreateDummyRecord(models.disaster, {
      name: 'Test disaster 2',
      countryCode: 'KI',
    });
    disaster3 = await findOrCreateDummyRecord(models.disaster, {
      name: 'Test disaster 3',
      countryCode: 'LA',
    });
    filter = {
      id: { comparator: 'in', comparisonValue: [disaster1.id, disaster2.id, disaster3.id] },
    };
    filterString = getFilterString(filter);
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /disasters/:id', async () => {
    it('Sufficient permissions: returns a requested disaster that user has access to', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`disasters/${disaster1.id}`);

      expect(result.id).to.equal(disaster1.id);
    });

    it('Insufficient permissions: throws an error if requesting disaster that user does not have access to', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`disasters/${disaster3.id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /disasters', async () => {
    it('Sufficient permissions: returns only disasters the user has permission to', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`disasters?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([disaster1.id, disaster2.id]);
    });

    it('Sufficient permissions: returns all disasters if the user has BES admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`disasters?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([disaster1.id, disaster2.id, disaster3.id]);
    });

    it('Returns disasters respecting single country code supplied', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const filterWithCountryCode = { ...filter, countryCode: 'KI' };
      const { body: results } = await app.get(
        `disasters?${getFilterString(filterWithCountryCode)}`,
      );

      expect(results.map(r => r.id)).to.deep.equal([disaster2.id]);
    });

    it('Returns disasters respecting multiple country codes supplied', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const filterWithCountryCode = { ...filter, countryCode: ['KI', 'LA'] };
      const { body: results } = await app.get(
        `disasters?${getFilterString(filterWithCountryCode)}`,
      );

      expect(results.map(r => r.id)).to.deep.equal([disaster2.id, disaster3.id]);
    });

    it('Insufficient permissions: returns an empty array if users do not have access to any disaster', async () => {
      const policy = {
        DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Public'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`disasters?${filterString}`);

      expect(results).to.be.empty;
    });

    it('Insufficient permissions: throws an error if user does not have admin panel access anywhere', async () => {
      const policy = {
        DL: ['Public'],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.get(`disasters`);

      expect(result).to.have.keys('error');
    });
  });
});
