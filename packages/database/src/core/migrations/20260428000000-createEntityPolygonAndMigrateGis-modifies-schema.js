'use strict';

import { generateId } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await db.runSql(`
    CREATE TABLE entity_polygon (
      id           TEXT PRIMARY KEY,
      polygon      geography(MultiPolygon,4326) NOT NULL,
      name         TEXT NOT NULL,
      code         TEXT,
      data_source  TEXT,
      created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
  `);

  await db.runSql(`CREATE INDEX entity_polygon_code_idx ON entity_polygon(code);`);

  await db.runSql(`
    ALTER TABLE entity ADD COLUMN entity_polygon_id TEXT
      REFERENCES entity_polygon(id) ON DELETE SET NULL;
  `);

  await db.runSql(`CREATE INDEX entity_entity_polygon_id_idx ON entity(entity_polygon_id);`);

  const entitiesWithGis = await db.runSql(
    `SELECT id, name, code FROM entity WHERE region IS NOT NULL;`,
  );

  for (const entity of entitiesWithGis.rows) {
    const polygonId = generateId();
    await db.runSql(
      `
        INSERT INTO entity_polygon (id, polygon, name, code)
        SELECT $1, region, $2, $3 FROM entity WHERE id = $4;
      `,
      [polygonId, entity.name, entity.code, entity.id],
    );
    await db.runSql(`UPDATE entity SET entity_polygon_id = $1 WHERE id = $2;`, [
      polygonId,
      entity.id,
    ]);
  }

  await db.runSql(`ALTER TABLE entity DROP COLUMN region;`);
};

exports.down = async function (db) {
  await db.runSql(`ALTER TABLE entity ADD COLUMN region geography(MultiPolygon,4326);`);

  await db.runSql(`
    UPDATE entity
    SET region = entity_polygon.polygon
    FROM entity_polygon
    WHERE entity.entity_polygon_id = entity_polygon.id;
  `);

  await db.runSql(`ALTER TABLE entity DROP COLUMN entity_polygon_id;`);
  await db.runSql(`DROP TABLE entity_polygon;`);
};

exports._meta = {
  version: 1,
  targets: ['server', 'browser'],
};
