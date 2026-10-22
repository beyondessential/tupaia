import { expect } from 'chai';
import { TestableApp, resetTestData } from '../../testUtilities';
import { BES_ADMIN_PERMISSION_GROUP, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';

const BES_ADMIN_POLICY = { DL: [BES_ADMIN_PERMISSION_GROUP] };
const NON_BES_ADMIN_POLICY = { DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP] };

const SAMPLE_POLYGON = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
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
    [JSON.stringify(SAMPLE_POLYGON), name, code, dataSource],
  );
  return id;
};

describe('entityPolygons CRUD', () => {
  const app = new TestableApp();
  const { models } = app;

  before(async () => {
    await resetTestData();
  });

  afterEach(async () => {
    app.revokeAccess();
    await models.database.executeSql('DELETE FROM entity_polygon;');
  });

  describe('POST /entityPolygons', () => {
    it('rejects non-BES-Admin', async () => {
      await app.grantAccess(NON_BES_ADMIN_POLICY);
      const response = await app.post('entityPolygons', {
        body: {
          name: 'Forbidden',
          code: 'fb-1',
          data_source: 'test',
          polygon: SAMPLE_POLYGON,
        },
      });
      expect(response.statusCode).to.not.equal(200);
    });

    it('creates a polygon, coercing Polygon→MultiPolygon', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const response = await app.post('entityPolygons', {
        body: {
          name: 'Test Region',
          code: 'tr-1',
          data_source: 'test_create',
          polygon: SAMPLE_POLYGON,
        },
      });
      expect(response.statusCode).to.equal(200);
      expect(response.body.entityPolygonId).to.be.a('string');

      const [row] = await models.database.executeSql(
        'SELECT name, code, data_source, ST_GeometryType(polygon::geometry) AS type FROM entity_polygon WHERE id = ?;',
        [response.body.entityPolygonId],
      );
      expect(row.name).to.equal('Test Region');
      expect(row.code).to.equal('tr-1');
      expect(row.data_source).to.equal('test_create');
      expect(row.type).to.equal('ST_MultiPolygon');
    });

    it('rejects non-polygon geometries', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const response = await app.post('entityPolygons', {
        body: {
          name: 'Bad geom',
          data_source: 'test',
          polygon: { type: 'Point', coordinates: [0, 0] },
        },
      });
      expect(response.statusCode).to.not.equal(200);
    });

    it('rejects missing name or data_source', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const noName = await app.post('entityPolygons', {
        body: { data_source: 'test', polygon: SAMPLE_POLYGON },
      });
      expect(noName.statusCode).to.not.equal(200);

      const noDataSource = await app.post('entityPolygons', {
        body: { name: 'X', polygon: SAMPLE_POLYGON },
      });
      expect(noDataSource.statusCode).to.not.equal(200);
    });
  });

  describe('PUT /entityPolygons/:id', () => {
    it('updates name/code/data_source', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const id = await insertPolygon(models.database, {
        name: 'Original',
        code: 'orig',
        dataSource: 'src',
      });

      const response = await app.put(`entityPolygons/${id}`, {
        body: { name: 'Renamed', code: 'new-code', data_source: 'src2' },
      });
      expect(response.statusCode).to.equal(200);

      const [row] = await models.database.executeSql(
        'SELECT name, code, data_source FROM entity_polygon WHERE id = ?;',
        [id],
      );
      expect(row.name).to.equal('Renamed');
      expect(row.code).to.equal('new-code');
      expect(row.data_source).to.equal('src2');
    });

    it('rejects polygon updates', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const id = await insertPolygon(models.database, {
        name: 'P',
        code: 'p',
        dataSource: 's',
      });

      const response = await app.put(`entityPolygons/${id}`, {
        body: { polygon: SAMPLE_POLYGON },
      });
      expect(response.statusCode).to.not.equal(200);
      expect(response.body.error).to.match(/polygon/i);
    });
  });

  describe('DELETE /entityPolygons/:id', () => {
    it('deletes and unlinks referencing entities', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const id = await insertPolygon(models.database, {
        name: 'ToDelete',
        code: 'td',
        dataSource: 's',
      });

      // create a referencing entity
      await models.database.executeSql(
        `INSERT INTO entity (id, code, name, type, entity_polygon_id) VALUES (?, ?, ?, ?, ?);`,
        ['entity_polygon_test_e1', 'epte1', 'Linked', 'village', id],
      );

      const response = await app.delete(`entityPolygons/${id}`);
      expect(response.statusCode).to.equal(200);

      const remaining = await models.database.executeSql(
        'SELECT id FROM entity_polygon WHERE id = ?;',
        [id],
      );
      expect(remaining).to.have.lengthOf(0);

      const [entity] = await models.database.executeSql(
        'SELECT entity_polygon_id FROM entity WHERE id = ?;',
        ['entity_polygon_test_e1'],
      );
      expect(entity.entity_polygon_id).to.equal(null);

      // cleanup
      await models.database.executeSql('DELETE FROM entity WHERE id = ?;', [
        'entity_polygon_test_e1',
      ]);
    });
  });

  describe('GET /entityPolygons', () => {
    it('returns polygons with linked_entity_codes', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const id = await insertPolygon(models.database, {
        name: 'WithLink',
        code: 'wl',
        dataSource: 's',
      });
      await models.database.executeSql(
        `INSERT INTO entity (id, code, name, type, entity_polygon_id) VALUES (?, ?, ?, ?, ?);`,
        ['gettest_e1', 'gtl-a', 'A', 'village', id],
      );
      await models.database.executeSql(
        `INSERT INTO entity (id, code, name, type, entity_polygon_id) VALUES (?, ?, ?, ?, ?);`,
        ['gettest_e2', 'gtl-b', 'B', 'village', id],
      );

      const response = await app.get(`entityPolygons/${id}`, {
        query: { columns: '["name","code","linked_entity_codes"]' },
      });
      expect(response.statusCode).to.equal(200);
      expect(response.body.linked_entity_codes).to.equal('gtl-a, gtl-b');

      await models.database.executeSql(
        'DELETE FROM entity WHERE id IN (?, ?);',
        ['gettest_e1', 'gettest_e2'],
      );
    });

    it('allows a non-BES-Admin with Tupaia Admin Panel access to read', async () => {
      // The entity edit modal's GIS-polygon picker reads this endpoint; non-BES
      // admin-panel users are allowed to set an entity's polygon link, so they
      // must be able to list polygons. (Create/edit/delete remain BES-only.)
      await app.grantAccess(NON_BES_ADMIN_POLICY);
      const id = await insertPolygon(models.database, {
        name: 'Readable',
        code: 'rd',
        dataSource: 's',
      });
      const response = await app.get(`entityPolygons/${id}`, {
        query: { columns: '["name","code"]' },
      });
      expect(response.statusCode).to.equal(200);
      expect(response.body.name).to.equal('Readable');
    });
  });
});
