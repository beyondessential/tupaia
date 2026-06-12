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

  describe('Facility classification round-trip (TUP-3181)', () => {
    // No updateCountryEntities stub — these exercise the real import path.
    // Facility classification (facility_type / type_name / category_code) is no
    // longer imported: those columns only ever wrote to the deprecated `clinic`
    // table, so the importer never writes a clinic row and ignores them entirely.
    const importRows = rows => {
      const filepath = writeXlsx(rows);
      return app
        .post('import/entities')
        .query({ projectCode: TEST_PROJECT_CODE, pushToDhis: 'false' })
        .attach('entities', filepath)
        .then(response => {
          unlinkXlsx(filepath);
          return response;
        });
    };

    before(async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
    });

    after(() => {
      app.revokeAccess();
    });

    it('imports a facility without writing a clinic row', async () => {
      const response = await importRows([
        {
          code: 'KI_clinicless_facility',
          name: 'Clinicless facility',
          entity_type: 'facility',
          country_code: 'KI',
        },
      ]);
      expect(response.statusCode).to.equal(200);

      const entity = await models.entity.findOne({ code: 'KI_clinicless_facility' });
      expect(entity).to.exist;
      const clinic = await models.facility.findOne({ code: 'KI_clinicless_facility' });
      expect(clinic).to.not.exist;
    });

    it('ignores facility_type/type_name/category_code columns (no validation error, no clinic row)', async () => {
      // '9' was previously an invalid facility_type that the importer rejected;
      // the column is now ignored, so the import succeeds and writes no clinic row.
      const response = await importRows([
        {
          code: 'KI_typed_facility',
          name: 'Typed facility',
          entity_type: 'facility',
          country_code: 'KI',
          facility_type: '9',
          type_name: 'Hospital',
          category_code: '1',
        },
      ]);
      expect(response.statusCode).to.equal(200);

      const clinic = await models.facility.findOne({ code: 'KI_typed_facility' });
      expect(clinic).to.not.exist;
    });
  });

  describe('Country rows on import (TUP-3181)', () => {
    const importRows = rows => {
      const filepath = writeXlsx(rows);
      return app
        .post('import/entities')
        .query({ projectCode: TEST_PROJECT_CODE, pushToDhis: 'false' })
        .attach('entities', filepath)
        .then(response => {
          unlinkXlsx(filepath);
          return response;
        });
    };

    before(async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
    });

    after(() => {
      app.revokeAccess();
    });

    it('skips country rows (the export includes them; they stay shared, not project-scoped)', async () => {
      const project = await models.project.findOne({ code: TEST_PROJECT_CODE });
      const response = await importRows([
        { code: 'KI', name: 'Kiribati', entity_type: 'country', country_code: 'KI' },
        {
          code: 'KI_country_skip_child',
          name: 'Child village',
          entity_type: 'village',
          country_code: 'KI',
        },
      ]);
      expect(response.statusCode).to.equal(200);

      // The sub-country row imported into the project...
      const child = await models.entity.findOne({
        code: 'KI_country_skip_child',
        project_id: project.id,
      });
      expect(child).to.exist;
      // ...but no project-scoped copy of the country entity was created.
      const projectScopedCountry = await models.entity.findOne({
        code: 'KI',
        project_id: project.id,
      });
      expect(projectScopedCountry).to.not.exist;
    });
  });

  describe('Attribute cells (TUP-3181)', () => {
    const importRows = rows => {
      const filepath = writeXlsx(rows);
      return app
        .post('import/entities')
        .query({ projectCode: TEST_PROJECT_CODE, pushToDhis: 'false' })
        .attach('entities', filepath)
        .then(response => {
          unlinkXlsx(filepath);
          return response;
        });
    };

    before(async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
    });

    after(() => {
      app.revokeAccess();
    });

    it('parses newline-separated key: value attributes and data_service_entity, coercing booleans', async () => {
      const response = await importRows([
        {
          code: 'KI_attr_facility',
          name: 'Attr facility',
          entity_type: 'facility',
          country_code: 'KI',
          attributes: 'area_type: island\nis_active: true',
          data_service_entity: 'kobo_id: 10302070',
        },
      ]);
      expect(response.statusCode).to.equal(200);

      const entity = await models.entity.findOne({ code: 'KI_attr_facility' });
      // strings stay strings; true/false round-trip back to booleans.
      expect(entity.attributes).to.deep.equal({ area_type: 'island', is_active: true });

      const dataServiceEntity = await models.dataServiceEntity.findOne({
        entity_code: 'KI_attr_facility',
      });
      // numeric-looking ids must stay strings, not be coerced to numbers.
      expect(dataServiceEntity.config).to.deep.equal({ kobo_id: '10302070' });
    });
  });
});
