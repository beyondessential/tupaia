import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { expect } from 'chai';
import { TestableApp, resetTestData } from '../../../testUtilities';
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../../../permissions';

const BES_ADMIN_POLICY = { DL: [BES_ADMIN_PERMISSION_GROUP] };
const NON_BES_ADMIN_POLICY = { DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP] };

const POLY = {
  type: 'Polygon',
  coordinates: [
    [
      [10, 10],
      [11, 10],
      [11, 11],
      [10, 11],
      [10, 10],
    ],
  ],
};

const MULTI_POLY = { type: 'MultiPolygon', coordinates: [POLY.coordinates] };

const writeTempGeojson = featureCollection => {
  const tmpPath = path.join(os.tmpdir(), `epi-test-${Date.now()}-${Math.random()}.geojson`);
  fs.writeFileSync(tmpPath, JSON.stringify(featureCollection));
  return tmpPath;
};

const insertPolygon = async (database, { name = 'Seed', code, dataSource, geometry = MULTI_POLY }) => {
  const [{ id }] = await database.executeSql(
    `
      INSERT INTO entity_polygon (polygon, name, code, data_source)
      VALUES (ST_Multi(ST_GeomFromGeoJSON(?)), ?, ?, ?)
      RETURNING id;
    `,
    [JSON.stringify(geometry), name, code, dataSource],
  );
  return id;
};

describe('importEntityPolygons(): POST /import/entityPolygons', () => {
  const app = new TestableApp();
  const { models } = app;

  before(async () => {
    await resetTestData();
  });

  afterEach(async () => {
    app.revokeAccess();
    await models.database.executeSql('DELETE FROM entity_polygon;');
  });

  it('rejects non-BES-Admin', async () => {
    await app.grantAccess(NON_BES_ADMIN_POLICY);
    const filePath = writeTempGeojson({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: POLY,
          properties: { name: 'F', data_source: 'test' },
        },
      ],
    });
    const response = await app.post('import/entityPolygons').attach('entityPolygons', filePath);
    expect(response.statusCode).to.not.equal(200);
    fs.unlinkSync(filePath);
  });

  it('creates a new polygon from a feature without id', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const filePath = writeTempGeojson({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: POLY,
          properties: { name: 'New One', code: 'new-1', data_source: 'imp_test' },
        },
      ],
    });
    const response = await app.post('import/entityPolygons').attach('entityPolygons', filePath);
    expect(response.statusCode).to.equal(200);
    expect(response.body.created).to.equal(1);
    expect(response.body.updated).to.equal(0);

    const [row] = await models.database.executeSql(
      'SELECT name, code, data_source FROM entity_polygon WHERE code = ?;',
      ['new-1'],
    );
    expect(row).to.exist;
    expect(row.name).to.equal('New One');
    fs.unlinkSync(filePath);
  });

  it('updates an existing polygon when matched by properties.id (round-trip)', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const existingId = await insertPolygon(models.database, {
      name: 'Original',
      code: 'rt-1',
      dataSource: 'imp_test',
    });

    const filePath = writeTempGeojson({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: POLY,
          properties: {
            id: existingId,
            name: 'Updated',
            code: 'rt-1-new',
            data_source: 'imp_test_v2',
          },
        },
      ],
    });
    const response = await app.post('import/entityPolygons').attach('entityPolygons', filePath);
    expect(response.statusCode).to.equal(200);
    expect(response.body.created).to.equal(0);
    expect(response.body.updated).to.equal(1);

    const [row] = await models.database.executeSql(
      'SELECT name, code, data_source FROM entity_polygon WHERE id = ?;',
      [existingId],
    );
    expect(row.name).to.equal('Updated');
    expect(row.code).to.equal('rt-1-new');
    expect(row.data_source).to.equal('imp_test_v2');
    fs.unlinkSync(filePath);
  });

  it('rejects features whose id does not match any row', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const filePath = writeTempGeojson({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: POLY,
          properties: {
            id: 'does_not_exist',
            name: 'Ghost',
            data_source: 'imp_test',
          },
        },
      ],
    });
    const response = await app.post('import/entityPolygons').attach('entityPolygons', filePath);
    expect(response.statusCode).to.not.equal(200);
    fs.unlinkSync(filePath);
  });

  it('upserts by (code, data_source) when id is absent', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    await insertPolygon(models.database, {
      name: 'Old',
      code: 'natural-1',
      dataSource: 'imp_test',
    });

    const filePath = writeTempGeojson({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: POLY,
          properties: { name: 'Refreshed', code: 'natural-1', data_source: 'imp_test' },
        },
      ],
    });
    const response = await app.post('import/entityPolygons').attach('entityPolygons', filePath);
    expect(response.statusCode).to.equal(200);
    expect(response.body.updated).to.equal(1);
    expect(response.body.created).to.equal(0);

    const rows = await models.database.executeSql(
      'SELECT name FROM entity_polygon WHERE code = ? AND data_source = ?;',
      ['natural-1', 'imp_test'],
    );
    expect(rows).to.have.lengthOf(1);
    expect(rows[0].name).to.equal('Refreshed');
    fs.unlinkSync(filePath);
  });

  it('coerces Polygon→MultiPolygon at storage time', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const filePath = writeTempGeojson({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: POLY,
          properties: { name: 'Poly', code: 'coerce', data_source: 'imp_test' },
        },
      ],
    });
    const response = await app.post('import/entityPolygons').attach('entityPolygons', filePath);
    expect(response.statusCode).to.equal(200);

    const [row] = await models.database.executeSql(
      'SELECT ST_GeometryType(polygon::geometry) AS type FROM entity_polygon WHERE code = ?;',
      ['coerce'],
    );
    expect(row.type).to.equal('ST_MultiPolygon');
    fs.unlinkSync(filePath);
  });

  it('rolls back the whole import if any feature fails', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    const filePath = writeTempGeojson({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: POLY,
          properties: { name: 'Good', code: 'rb-good', data_source: 'imp_test' },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: { name: 'Bad', code: 'rb-bad', data_source: 'imp_test' },
        },
      ],
    });
    const response = await app.post('import/entityPolygons').attach('entityPolygons', filePath);
    expect(response.statusCode).to.not.equal(200);

    const rows = await models.database.executeSql(
      'SELECT id FROM entity_polygon WHERE code IN (?, ?);',
      ['rb-good', 'rb-bad'],
    );
    expect(rows).to.have.lengthOf(0);
    fs.unlinkSync(filePath);
  });
});
