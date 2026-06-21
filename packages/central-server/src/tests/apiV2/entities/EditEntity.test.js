import { expect } from 'chai';
import { findOrCreateDummyRecord, generateId } from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../testUtilities';

describe("Editing an entity's name", async () => {
  const BES_ADMIN_POLICY = {
    SB: [BES_ADMIN_PERMISSION_GROUP],
  };

  const TUPAIA_ADMIN_POLICY = {
    SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;

  const ENTITY = {
    code: 'test_entity',
    id: generateId(),
    name: 'original_name',
    country_code: 'SB',
  };
  before(async () => {
    await findOrCreateDummyRecord(models.entity, ENTITY);
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('PUT /entities/:id', async () => {
    it('Successfully changes the entity name if the user has BES Admin permissions', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      await app.put(`entities/${ENTITY.id}`, {
        body: { name: 'new_name' },
      });

      const result = await models.entity.find({ id: ENTITY.id, name: 'new_name' });
      expect(result.length).to.equal(1);
      expect(result[0].name).to.equal('new_name');
    });

    it('Successfully changes the entity name if the user has Tupaia Admin Panel permissions for the entity country', async () => {
      await app.grantAccess(TUPAIA_ADMIN_POLICY);
      await app.put(`entities/${ENTITY.id}`, {
        body: { name: 'new_name' },
      });

      const result = await models.entity.find({ id: ENTITY.id, name: 'new_name' });
      expect(result.length).to.equal(1);
      expect(result[0].name).to.equal('new_name');
    });

    it('Throws an exception if we do not have Admin access to the country', async () => {
      await app.grantAccess({
        SB: ['Public'],
      });
      const { body: result } = await app.put(`entities/${ENTITY.id}`, {
        body: { name: 'new_name' },
      });

      expect(result).to.deep.equal({
        error:
          'One of the following conditions need to be satisfied:\nNeed BES Admin access\nNeed Tupaia Admin Panel access to country ‘SB’ to edit entity ‘new_name’',
      });
    });
  });
});

describe("Syncing an entity's bounds with its GIS polygon", async () => {
  const BES_ADMIN_POLICY = {
    SB: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;

  // A square well away from the polygon below, so a stale bounds is obvious.
  const STALE_BOUNDS = {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
          [0, 0],
        ],
      ],
    ],
  };
  const POLYGON_GEOMETRY = {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [40, 40],
          [41, 40],
          [41, 41],
          [40, 41],
          [40, 40],
        ],
      ],
    ],
  };

  const ENTITY = {
    code: 'bounds_sync_entity',
    id: generateId(),
    name: 'Bounds Sync',
    country_code: 'SB',
  };

  let polygonId;

  const getBoundsIsNull = async () => {
    const [row] = await models.database.executeSql(
      'SELECT bounds IS NULL AS is_null FROM entity WHERE id = ?;',
      [ENTITY.id],
    );
    return row.is_null;
  };

  const boundsMatchesPolygonEnvelope = async () => {
    const [row] = await models.database.executeSql(
      `
        SELECT ST_Equals(e.bounds, ST_Envelope(ep.polygon::geometry)) AS matches
        FROM entity e
        CROSS JOIN entity_polygon ep
        WHERE e.id = ? AND ep.id = ?;
      `,
      [ENTITY.id, polygonId],
    );
    return row.matches;
  };

  before(async () => {
    await findOrCreateDummyRecord(models.entity, ENTITY);
    // Seed a stale bounds, as if left over from a previously linked polygon.
    await models.database.executeSql(
      'UPDATE entity SET bounds = ST_Envelope(ST_GeomFromGeoJSON(?)::geometry) WHERE id = ?;',
      [JSON.stringify(STALE_BOUNDS), ENTITY.id],
    );
    const [{ id }] = await models.database.executeSql(
      `
        INSERT INTO entity_polygon (polygon, name, code, data_source)
        VALUES (ST_Multi(ST_GeomFromGeoJSON(?)), ?, ?, ?)
        RETURNING id;
      `,
      [JSON.stringify(POLYGON_GEOMETRY), 'Bounds Sync Polygon', 'bs-poly-1', 'test'],
    );
    polygonId = id;
  });

  after(async () => {
    await models.entity.delete({ id: ENTITY.id });
    await models.database.executeSql('DELETE FROM entity_polygon WHERE id = ?;', [polygonId]);
  });

  afterEach(() => {
    app.revokeAccess();
  });

  it('recomputes bounds from the newly linked polygon rather than keeping the stale bounds', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    await app.put(`entities/${ENTITY.id}`, {
      body: { entity_polygon_id: polygonId },
    });

    expect(await getBoundsIsNull()).to.equal(false);
    expect(await boundsMatchesPolygonEnvelope()).to.equal(true);
  });

  it('clears bounds when the polygon is unlinked', async () => {
    await app.grantAccess(BES_ADMIN_POLICY);
    await app.put(`entities/${ENTITY.id}`, {
      body: { entity_polygon_id: '' },
    });

    expect(await getBoundsIsNull()).to.equal(true);
  });
});
