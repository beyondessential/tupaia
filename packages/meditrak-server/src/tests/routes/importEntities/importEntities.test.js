/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';
import { Authenticator } from '@tupaia/auth';
import { findOrCreateDummyRecord, findOrCreateDummyCountryEntity } from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import * as PopulateCoordinatesForCountry from '../../../routes/importEntities/populateCoordinatesForCountry';
import * as UpdateCountryEntities from '../../../routes/importEntities/updateCountryEntities';
import { TestableApp } from '../../TestableApp';
import { expectPermissionError } from '../../testUtilities/expectResponseError';

const DEFAULT_POLICY = {
  DL: ['Public'],
  KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
  VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
  LA: ['Admin'],
};

const BES_ADMIN_POLICY = {
  LA: [BES_ADMIN_PERMISSION_GROUP],
};

const TEST_DATA_FOLDER = 'src/tests/testData';

const prepareStubAndAuthenticate = async (app, policy = DEFAULT_POLICY) => {
  sinon.stub(Authenticator.prototype, 'getAccessPolicyForUser').returns(policy);
  await app.authenticate();
};

describe('importEntities(): POST import/entities', () => {
  const app = new TestableApp();
  const models = app.models;

  before(async () => {
    await findOrCreateDummyRecord(models.entity, {
      code: 'World',
      name: 'World',
      type: 'world',
      country_code: 'wo',
    });

    await findOrCreateDummyCountryEntity(models, {
      code: 'KI',
      name: 'Kiribati',
    });

    await findOrCreateDummyCountryEntity(models, {
      code: 'LA',
      name: 'Laos',
    });

    await findOrCreateDummyCountryEntity(models, {
      code: 'SB',
      name: 'Solomon Islands',
    });

    await findOrCreateDummyCountryEntity(models, {
      code: 'VU',
      name: 'Vanuatu',
    });
  });
  describe('Test permissions when importing entities', async () => {
    const importFile = filename =>
      app.post('import/entities').attach('entities', `${TEST_DATA_FOLDER}/entities/${filename}`);

    before(async () => {
      //Only test permissions part so stub these methods to ignore them
      sinon.stub(UpdateCountryEntities, 'updateCountryEntities').returns({ code: 'DL' });
      sinon.stub(PopulateCoordinatesForCountry, 'populateCoordinatesForCountry');
    });

    afterEach(() => {
      Authenticator.prototype.getAccessPolicyForUser.restore();
    });

    it('Sufficient permissions: Should pass permissions check when importing multiple sub national entities within 1 country if users have Tupaia Admin Panel access to that country', async () => {
      await prepareStubAndAuthenticate(app, BES_ADMIN_POLICY);
      const response = await importFile('sufficientPermissionsImportEntities1Country.xlsx');
      const { statusCode } = response;

      expect(statusCode).to.equal(200);
    });

    it('Sufficient permissions: Should pass permissions check when importing multiple sub national entities within MULTIPLE countries if users have Tupaia Admin Panel access to all the countries of the entities', async () => {
      await prepareStubAndAuthenticate(app);
      const response = await importFile(
        'sufficientPermissionsImportEntitiesMultipleCountries.xlsx',
      );
      const { statusCode } = response;

      expect(statusCode).to.equal(200);
    });

    it('Sufficient permissions: Should pass permissions check when importing multiple sub national entities if users have BES Admin access to any countries', async () => {
      await prepareStubAndAuthenticate(app, BES_ADMIN_POLICY);
      const response = await importFile(
        'insufficientPermissionsImportEntitiesMultipleCountries.xlsx',
      );
      const { statusCode } = response;
      expect(statusCode).to.equal(200);
    });

    it('Sufficient permissions: Should pass permissions check when importing a national entity successfully if users have BES Admin access to any countries', async () => {
      await prepareStubAndAuthenticate(app, BES_ADMIN_POLICY);
      const response = await importFile('importNewCountryEntity.xlsx');
      const { statusCode } = response;

      expect(statusCode).to.equal(200);
    });

    it('Insufficient permissions: Should return an error when importing entities if users do not have Tupaia Admin Panel access to any country of the entities', async () => {
      await prepareStubAndAuthenticate(app); //DEFAULT_POLICY does not have Tupaia Admin Panel access to Laos
      const response = await importFile(
        'insufficientPermissionsImportEntitiesMultipleCountries.xlsx',
      );

      expectPermissionError(response, /Need Tupaia Admin Panel access to country Laos/);
    });

    it('Insufficient permissions: Should return an error when importing a new country entity and no BES Admin access to any countries', async () => {
      await prepareStubAndAuthenticate(app);
      const response = await importFile('importNewCountryEntity.xlsx');

      expectPermissionError(response, /Need BES Admin/);
    });
  });
});
