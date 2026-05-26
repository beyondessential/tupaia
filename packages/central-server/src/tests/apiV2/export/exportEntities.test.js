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

// Helper that issues a buffered GET and parses the response body as raw xlsx
// bytes. Without the custom parser, supertest tries to JSON-decode the binary
// body and `response.body` ends up as `{}` — writing that to disk fails.
const downloadXlsx = async getRequest => {
  const response = await getRequest
    .buffer(true)
    .parse((res, callback) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => callback(null, Buffer.concat(chunks)));
    });
  return { response, workbook: xlsx.read(response.body, { type: 'buffer' }) };
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

  it('emits a single sheet containing all project entities', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const { response, workbook } = await downloadXlsx(
      app.get('export/entities/export_entities_test'),
    );
    expect(response.statusCode).to.equal(200);

    expect(workbook.SheetNames).to.have.lengthOf(1);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    const countryCodes = new Set(rows.map(r => r.country_code));
    // Both KI and VU entities should appear in the single sheet.
    expect(countryCodes.has('KI')).to.equal(true);
    expect(countryCodes.has('VU')).to.equal(true);
  });

  it('emits the round-trip column set including all three polygon-ref columns', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const { workbook } = await downloadXlsx(app.get('export/entities/export_entities_test'));

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
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
      'entity_polygon_code',
      'entity_polygon_data_source',
      'data_service_entity',
    );
  });

  it('omits country, world, and project entities (out of scope for entity import)', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const { workbook } = await downloadXlsx(app.get('export/entities/export_entities_test'));

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    const types = new Set(rows.map(r => r.type));
    expect(types.has('country')).to.equal(false);
    expect(types.has('world')).to.equal(false);
    expect(types.has('project')).to.equal(false);
  });
});
