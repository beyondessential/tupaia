/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';
import { Authenticator } from '@tupaia/auth';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';
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
  LA: ['BES Admin'],
};

const TEST_DATA_FOLDER = 'src/tests/testData';

const prepareStubAndAuthenticate = async (app, policy = DEFAULT_POLICY) => {
  sinon.stub(Authenticator.prototype, 'getAccessPolicyForUser').returns(policy);
  await app.authenticate();
};

describe('importEntities(): POST import/entities', () => {
  const app = new TestableApp();

  describe('Test permissions when importing entities', async () => {
    const importFile = filename =>
      app.post('import/entities').attach('entities', `${TEST_DATA_FOLDER}/entities/${filename}`);

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
