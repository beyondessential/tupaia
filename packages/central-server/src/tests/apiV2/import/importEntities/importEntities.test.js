import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import sinon from 'sinon';
import { findOrCreateDummyRecord, addBaselineTestCountries } from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../../permissions';
import * as PopulateCoordinatesForCountry from '../../../../apiV2/import/importEntities/populateCoordinatesForCountry';
import * as UpdateCountryEntities from '../../../../apiV2/import/importEntities/updateCountryEntities';
import { expectPermissionError, TestableApp } from '../../../testUtilities';

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

describe('importEntities(): POST import/entities', () => {
  const app = new TestableApp();
  const { models } = app;

  before(async () => {
    await findOrCreateDummyRecord(models.entity, {
      code: 'World',
      name: 'World',
      type: 'world',
      country_code: 'Wo',
    });

    await addBaselineTestCountries(models);
  });
  describe('Test permissions when importing entities', async () => {
    const importFile = filename =>
      app.post('import/entities').attach('entities', `${TEST_DATA_FOLDER}/entities/${filename}`);

    before(() => {
      // Only test permissions part so stub these methods to avoid them being called
      sinon.stub(UpdateCountryEntities, 'updateCountryEntities').resolves({ code: 'DL' });
      sinon.stub(PopulateCoordinatesForCountry, 'populateCoordinatesForCountry');
    });

    after(() => {
      UpdateCountryEntities.updateCountryEntities.restore();
      PopulateCoordinatesForCountry.populateCoordinatesForCountry.restore();
    });

    afterEach(() => {
      app.revokeAccess();
    });

    it('Sufficient permissions: Should pass permissions check when importing multiple sub national entities within 1 country if users have Tupaia Admin Panel access to that country', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const response = await importFile('sufficientPermissionsImportEntities1Country.xlsx');
      const { statusCode } = response;

      expect(statusCode).to.equal(200);
    });

    it('Sufficient permissions: Should pass permissions check when importing multiple sub national entities within MULTIPLE countries if users have Tupaia Admin Panel access to all the countries of the entities', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const response = await importFile(
        'sufficientPermissionsImportEntitiesMultipleCountries.xlsx',
      );
      const { statusCode } = response;

      expect(statusCode).to.equal(200);
    });

    it('Sufficient permissions: Should pass permissions check when importing multiple sub national entities if users have BES Admin access to any countries', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const response = await importFile(
        'insufficientPermissionsImportEntitiesMultipleCountries.xlsx',
      );
      const { statusCode } = response;
      expect(statusCode).to.equal(200);
    });

    it('Sufficient permissions: Should pass permissions check when importing a national entity successfully if users have BES Admin access to any countries', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const response = await importFile('importNewCountryEntity.xlsx');
      const { statusCode } = response;

      expect(statusCode).to.equal(200);
    });

    it('Insufficient permissions: Should return an error when importing entities if users do not have Tupaia Admin Panel access to any country of the entities', async () => {
      await app.grantAccess(DEFAULT_POLICY); // DEFAULT_POLICY does not have Tupaia Admin Panel access to Laos
      const response = await importFile(
        'insufficientPermissionsImportEntitiesMultipleCountries.xlsx',
      );

      expectPermissionError(response, /Need Tupaia Admin Panel access to country Laos/);
    });

    it('Insufficient permissions: Should return an error when importing a new country entity and no BES Admin access to any countries', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const response = await importFile('importNewCountryEntity.xlsx');

      expectPermissionError(response, /Need BES Admin/);
    });
  });
});
