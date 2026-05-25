import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import xlsx from 'xlsx';
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

// Programmatically build a single-sheet xlsx from row objects. Returns a
// temp filepath; caller is responsible for cleanup via `unlinkXlsx`.
const writeXlsx = rows => {
  const tmp = path.join(os.tmpdir(), `importEntities-test-${Date.now()}-${Math.random()}.xlsx`);
  const sheet = xlsx.utils.json_to_sheet(rows);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, sheet, 'Entities');
  xlsx.writeFile(workbook, tmp);
  return tmp;
};

const unlinkXlsx = filepath => {
  try {
    fs.unlinkSync(filepath);
  } catch {
    /* already gone */
  }
};

const subNationalRows = countryCodes => {
  // One sub-national village per country — minimal valid payload.
  return countryCodes.map(country_code => ({
    code: `${country_code}_test_village`,
    name: `${country_code} test village`,
    entity_type: 'village',
    country_code,
  }));
};

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

    // Project containing every country referenced by the permission tests, so
    // the new row-level project-country validation passes.
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

  describe('Permissions', async () => {
    const uploadCountries = (countryCodes, projectCode = TEST_PROJECT_CODE) => {
      const filepath = writeXlsx(subNationalRows(countryCodes));
      const req = app.post('import/entities');
      if (projectCode !== undefined) req.query({ projectCode });
      return req.attach('entities', filepath).then(response => {
        unlinkXlsx(filepath);
        return response;
      });
    };

    before(() => {
      // Stub the body of the import to isolate permissions logic from the
      // entity-creation work that runs in a transaction.
      sinon.stub(UpdateCountryEntities, 'updateCountryEntities').resolves({ code: 'DL' });
    });

    after(() => {
      UpdateCountryEntities.updateCountryEntities.restore();
    });

    afterEach(() => {
      app.revokeAccess();
    });

    it('Sufficient: BES Admin can import any country', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const response = await uploadCountries(['LA']);
      expect(response.statusCode).to.equal(200);
    });

    it('Sufficient: Tupaia Admin Panel access to every uploaded country', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const response = await uploadCountries(['KI', 'SB', 'VU']);
      expect(response.statusCode).to.equal(200);
    });

    it('Insufficient: missing Tupaia Admin Panel access to one of the uploaded countries', async () => {
      // DEFAULT_POLICY lacks Tupaia Admin Panel access to Laos.
      await app.grantAccess(DEFAULT_POLICY);
      const response = await uploadCountries(['KI', 'LA']);
      expectPermissionError(response, /Need Tupaia Admin Panel access to country LA/);
    });
  });

  describe('Project context validation (TUP-3061)', async () => {
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
      const filepath = writeXlsx(subNationalRows(['KI']));
      const response = await app.post('import/entities').attach('entities', filepath);
      unlinkXlsx(filepath);

      expect(response.statusCode).to.not.equal(200);
      expect(response.body.error).to.match(/projectCode/i);
    });

    it('rejects when projectCode does not exist', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const filepath = writeXlsx(subNationalRows(['KI']));
      const response = await app
        .post('import/entities')
        .query({ projectCode: 'does_not_exist' })
        .attach('entities', filepath);
      unlinkXlsx(filepath);

      expect(response.statusCode).to.not.equal(200);
    });

    it('rejects rows whose country_code is not in the active project', async () => {
      // Build a project that excludes Laos, then upload a Laos row.
      await buildAndInsertProjectsAndHierarchies(models, [
        {
          code: 'no_laos',
          name: 'No Laos',
          entities: [{ code: 'KI', country_code: 'KI' }],
        },
      ]);
      await app.grantAccess(BES_ADMIN_POLICY);
      const filepath = writeXlsx(subNationalRows(['LA']));
      const response = await app
        .post('import/entities')
        .query({ projectCode: 'no_laos' })
        .attach('entities', filepath);
      unlinkXlsx(filepath);

      expect(response.statusCode).to.not.equal(200);
      expect(response.body.error).to.match(/not in project no_laos|country_code/i);
    });

    it('rejects rows missing country_code', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const filepath = writeXlsx([
        {
          code: 'no_country_test',
          name: 'No country test',
          entity_type: 'village',
          // country_code intentionally omitted
        },
      ]);
      const response = await app
        .post('import/entities')
        .query({ projectCode: TEST_PROJECT_CODE })
        .attach('entities', filepath);
      unlinkXlsx(filepath);

      expect(response.statusCode).to.not.equal(200);
      expect(response.body.error).to.match(/country_code/i);
    });
  });
});
