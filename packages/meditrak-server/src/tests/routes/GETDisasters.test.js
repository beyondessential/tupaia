/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { findOrCreateDummyRecord } from '@tupaia/database';
import { Authenticator } from '@tupaia/auth';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import { TestableApp } from '../TestableApp';
import { prepareStubAndAuthenticate } from './utilities/prepareStubAndAuthenticate';

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
    filterString = `filter={"id":{"comparator":"in","comparisonValue":["${disaster1.id}", "${disaster2.id}", "${disaster3.id}"]}}`;
  });

  afterEach(() => {
    Authenticator.prototype.getAccessPolicyForUser.restore();
  });

  describe('GET /disasters/:id', async () => {
    it('Sufficient permissions: Should return a requested disaster that user has access to', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: result } = await app.get(`disasters/${disaster1.id}`);

      expect(result.id).to.equal(disaster1.id);
    });

    it('Insufficient permissions: Should throw an error if requesting disaster that user does not have access to', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: result } = await app.get(`disasters/${disaster3.id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /disasters', async () => {
    it('Sufficient permissions: Should return only disasters the user has permission to', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: results } = await app.get(`disasters?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([disaster1.id, disaster2.id]);
    });

    it('Sufficient permissions: Should return all disasters if the user has BES admin access', async () => {
      await prepareStubAndAuthenticate(app, BES_ADMIN_POLICY);
      const { body: results } = await app.get(`disasters?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([disaster1.id, disaster2.id, disaster3.id]);
    });

    it('Insufficient permissions: Should return an empty array if users do not have access to any disaster', async () => {
      const policy = {
        DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Public'],
      };
      await prepareStubAndAuthenticate(app, policy);
      const { body: results } = await app.get(`disasters?${filterString}`);

      expect(results).to.be.empty;
    });

    it('Insufficient permissions: Should throw an error if user does not have admin panel access anywhere', async () => {
      const policy = {
        DL: ['Public'],
      };
      await prepareStubAndAuthenticate(app, policy);
      const { body: result } = await app.get(`disasters`);

      expect(result).to.have.keys('error');
    });
  });
});
