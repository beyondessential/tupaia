import fs from 'node:fs';
import xlsx from 'xlsx';
import { expect } from 'chai';
import { buildAndInsertProjectsAndHierarchies } from '@tupaia/database';
import { TestableApp, resetTestData } from '../../testUtilities';
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../../permissions';

const BES_ADMIN_POLICY = { DL: [BES_ADMIN_PERMISSION_GROUP] };
const NON_BES_ADMIN_POLICY = { DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP] };

const downloadXlsx = response => {
  const tmp = `/tmp/exportEntities-test-${Date.now()}.xlsx`;
  fs.writeFileSync(tmp, response.body);
  const workbook = xlsx.readFile(tmp);
  fs.unlinkSync(tmp);
  return workbook;
};

describe('exportEntities: GET /export/entities/:projectCode', () => {
  const app = new TestableApp();
  const { models } = app;

  before(async () => {
    await resetTestData();
    await buildAndInsertProjectsAndHierarchies(models, [
      {
        code: 'export_entities_test',
        name: 'Export Entities Test',
        entities: [
          { code: 'KI', country_code: 'KI' },
          { code: 'VU', country_code: 'VU' },
          { code: 'KI_village_1', country_code: 'KI', type: 'village', parent_code: 'KI' },
          { code: 'VU_village_1', country_code: 'VU', type: 'village', parent_code: 'VU' },
        ],
      },
    ]);
  });

  afterEach(() => {
    app.revokeAccess();
  });

  it('rejects non-BES-Admin', async () => {
    await app.grantAccess(NON_BES_ADMIN_POLICY);
    const response = await app.get('export/entities/export_entities_test');
    expect(response.statusCode).to.not.equal(200);
  });

  it('returns 400 for unknown projectCode', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const response = await app.get('export/entities/does_not_exist');
    expect(response.statusCode).to.equal(400);
  });

  it('emits one sheet per country, sheet name = country_code', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const response = await app.get('export/entities/export_entities_test').buffer();
    expect(response.statusCode).to.equal(200);

    const workbook = downloadXlsx(response);
    expect(workbook.SheetNames).to.include.members(['KI', 'VU']);
  });

  it('emits the round-trip column set', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const response = await app.get('export/entities/export_entities_test').buffer();
    const workbook = downloadXlsx(response);

    const sheet = workbook.Sheets['KI'];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
    expect(rows.length).to.be.greaterThan(0);

    const firstRow = rows[0];
    expect(firstRow).to.have.all.keys(
      'name',
      'code',
      'type',
      'country_code',
      'parent_code',
      'attributes',
      'image_url',
      'entity_polygon_id',
      'data_service_entity',
    );
  });

  it('omits country, world, and project entities (they are sheet-implicit / out of scope)', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const response = await app.get('export/entities/export_entities_test').buffer();
    const workbook = downloadXlsx(response);

    const sheet = workbook.Sheets['KI'];
    const rows = xlsx.utils.sheet_to_json(sheet);
    const types = new Set(rows.map(r => r.type));
    expect(types.has('country')).to.equal(false);
    expect(types.has('world')).to.equal(false);
    expect(types.has('project')).to.equal(false);
  });
});
