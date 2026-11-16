import fs from 'node:fs';
import { expect } from 'chai';
import { TestableApp, resetTestData } from '../../testUtilities';
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../../permissions';

const BES_ADMIN_POLICY = { DL: [BES_ADMIN_PERMISSION_GROUP] };
const NON_BES_ADMIN_POLICY = { DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP] };

const POLY = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 2],
      [0, 0],
    ],
  ],
};

const insertPolygon = async (database, { name, code, dataSource }) => {
  const [{ id }] = await database.executeSql(
    `
      INSERT INTO entity_polygon (polygon, name, code, data_source)
      VALUES (ST_Multi(ST_GeomFromGeoJSON(?)), ?, ?, ?)
      RETURNING id;
    `,
    [JSON.stringify(POLY), name, code, dataSource],
  );
  return id;
};

describe('exportEntityPolygons: GET /export/entityPolygons/:id', () => {
  const app = new TestableApp();
  const { models } = app;
  const downloadedFiles = [];

  before(async () => {
    await resetTestData();
  });

  afterEach(async () => {
    app.revokeAccess();
    await models.database.executeSql('DELETE FROM entity_polygon;');
    for (const f of downloadedFiles) {
      try {
        fs.unlinkSync(f);
      } catch {
        /* file already removed by respondWithDownload */
      }
    }
    downloadedFiles.length = 0;
  });

  it('rejects non-BES-Admin', async () => {
    await app.grantAccess(NON_BES_ADMIN_POLICY);
    const id = await insertPolygon(models.database, {
      name: 'X',
      code: 'x',
      dataSource: 'src',
    });
    const response = await app.get(`export/entityPolygons/${id}`);
    expect(response.statusCode).to.not.equal(200);
  });

  it('returns a single-feature GeoJSON FeatureCollection', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const id = await insertPolygon(models.database, {
      name: 'Region 1',
      code: 'r1',
      dataSource: 'src1',
    });

    const response = await app.get(`export/entityPolygons/${id}`).buffer().parse((res, cb) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => cb(null, Buffer.concat(chunks).toString('utf8')));
    });

    expect(response.statusCode).to.equal(200);
    const contentDisposition = response.headers['content-disposition'] || '';
    expect(contentDisposition).to.match(/\.geojson/);

    const featureCollection = JSON.parse(response.body);
    expect(featureCollection.type).to.equal('FeatureCollection');
    expect(featureCollection.features).to.have.lengthOf(1);
    const [feature] = featureCollection.features;
    expect(feature.type).to.equal('Feature');
    expect(feature.properties).to.deep.include({
      id,
      code: 'r1',
      name: 'Region 1',
      data_source: 'src1',
    });
    expect(feature.geometry.type).to.equal('MultiPolygon');
  });

  it('returns 404 for unknown id', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const response = await app.get('export/entityPolygons/does_not_exist');
    expect(response.statusCode).to.equal(404);
  });
});
