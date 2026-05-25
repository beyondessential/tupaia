import { expect } from 'chai';
import sinon from 'sinon';
import {
  findOrCreateDummyRecord,
  addBaselineTestCountries,
  buildAndInsertProjectsAndHierarchies,
} from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../../permissions';
import * as ImportEntities from '../../../../apiV2/import/importEntities/importEntities';
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

const TEST_PROJECT_CODE = 'import_test';
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

    // Create a project containing all the countries the existing test files
    // reference, so the new sheet-level project-country validation passes.
    await buildAndInsertProjectsAndHierarchies(models, [
      {
        code: TEST_PROJECT_CODE,
        name: 'Import Test',
        entities: [
          { code: 'DL', country_code: 'DL' },
          { code: 'KI', country_code: 'KI' },
          { code: 'SB', country_code: 'SB' },
          { code: 'VU', country_code: 'VU' },
          { code: 'LA', country_code: 'LA' },
          { code: 'TO', country_code: 'TO' },
        ],
      },
    ]);
  });

  describe('Test permissions when importing entities', async () => {
    const importFile = filename =>
      app
        .post('import/entities')
        .query({ projectCode: TEST_PROJECT_CODE })
        .attach('entities', `${TEST_DATA_FOLDER}/entities/${filename}`);

    before(() => {
      // Only test permissions part so stub the body of the import to avoid
      // the actual entity-creation logic running.
      sinon.stub(UpdateCountryEntities, 'updateCountryEntities').resolves({ code: 'DL' });
    });

    after(() => {
      UpdateCountryEntities.updateCountryEntities.restore();
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

  describe('Project context validation (TUP-3061)', async () => {
    const importFile = (filename, projectCode) => {
      const req = app
        .post('import/entities')
        .attach('entities', `${TEST_DATA_FOLDER}/entities/${filename}`);
      if (projectCode !== undefined) req.query({ projectCode });
      return req;
    };

    before(() => {
      sinon.stub(UpdateCountryEntities, 'updateCountryEntities').resolves({ code: 'DL' });
    });

    after(() => {
      UpdateCountryEntities.updateCountryEntities.restore();
    });

    afterEach(() => {
      app.revokeAccess();
    });

    it('rejects when projectCode is missing', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const response = await importFile(
        'sufficientPermissionsImportEntities1Country.xlsx',
        undefined,
      );
      expect(response.statusCode).to.not.equal(200);
      expect(response.body.error).to.match(/projectCode/i);
    });

    it('rejects when projectCode does not exist', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const response = await importFile(
        'sufficientPermissionsImportEntities1Country.xlsx',
        'does_not_exist',
      );
      expect(response.statusCode).to.not.equal(200);
    });

    it('rejects when a sheet country is not in the active project', async () => {
      // Build a project that excludes Laos, then upload a Laos sheet.
      await buildAndInsertProjectsAndHierarchies(models, [
        {
          code: 'no_laos',
          name: 'No Laos',
          entities: [{ code: 'KI', country_code: 'KI' }],
        },
      ]);
      await app.grantAccess(BES_ADMIN_POLICY);
      const response = await importFile(
        'insufficientPermissionsImportEntitiesMultipleCountries.xlsx',
        'no_laos',
      );
      expect(response.statusCode).to.not.equal(200);
      expect(response.body.error).to.match(/not in project no_laos|Laos/i);
    });
  });
});
