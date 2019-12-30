'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(`
    CREATE INDEX entity_code ON entity(code);

    ALTER TABLE "entity"
      ADD COLUMN "bounds" GEOGRAPHY(POLYGON);

    UPDATE "entity"
      SET "bounds" = ST_Envelope("region"::geometry);

    UPDATE "entity"
      SET "bounds" = ST_GeomFromGeoJSON('{
        "type": "Polygon",
        "coordinates": [[
          [ 149, 6.5 ],
          [ 204.5, 6.5 ],
          [ 204.5, -30 ],
          [ 149, -30 ],
          [ 149, 6.5 ]
        ]]
      }')
      WHERE "code" = 'World';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    ALTER TABLE "entity"
      DROP COLUMN "bounds";

    DROP INDEX entity_code;
  `);
};

exports._meta = {
  version: 1,
};
