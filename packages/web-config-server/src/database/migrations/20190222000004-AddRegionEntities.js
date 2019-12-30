'use strict';

import { insertObject } from '../migrationUtilities';
import { readdirSync, readFileSync } from 'fs';

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

const basePath = 'src/database/migrationData/20190222000004-AddRegionEntities/';
const regionFiles = readdirSync(basePath);

exports.up = async function(db) {
  await db.runSql(`
    ALTER TABLE "entity"
      ALTER COLUMN "code" TYPE VARCHAR(64),
      ALTER COLUMN "id" TYPE VARCHAR(64),
      ALTER COLUMN "parent_code" TYPE VARCHAR(64),
      ALTER COLUMN "region" TYPE GEOGRAPHY(MULTIPOLYGON);
  `);

  const regions = regionFiles
    .map(rf => basePath + rf) // get paths
    .map(rf => readFileSync(rf)) // read files
    .map(data => JSON.parse(data)) // parse data
    .map(data => ({
      // add IDs
      id: data.code,
      ...data,
    }));

  // add to database
  await Promise.all(
    regions
      .map(({ geojson, facilityCodes, ...rest }) => rest)
      .map(c => insertObject(db, 'entity', c)),
  );

  // need to set region separately as we're going through a function rather
  // than setting the value directly
  const regionsWithGeoJson = regions.filter(r => r.geojson);
  for (var i = 0; i < regionsWithGeoJson.length; ++i) {
    const { geojson, code } = regionsWithGeoJson[i];

    await db.runSql(
      `
      UPDATE "entity"
        SET "region" = ST_GeomFromGeoJSON('${geojson}')
        WHERE "code" = '${code}';
    `,
      err => err && console.log(err),
    );
  }

  // set facility parents
  const regionsWithChildren = regions.filter(r => r.facilityCodes.length);
  for (var i = 0; i < regionsWithChildren.length; ++i) {
    const { facilityCodes, code } = regionsWithChildren[i];
    const codes = facilityCodes.map(f => `"${f}"`).join(',');

    await db.runSql(
      `
      UPDATE "entity"
        SET "parent_code" = '${code}'
        WHERE "code" = ANY('{${codes}}');
    `,
      err => err && console.log(err),
    );
  }
};

exports.down = async function(db) {
  await db.runSql(`
    DELETE FROM "entity"
      WHERE "type" = 'country'
      OR "type" = 'world'
      OR "type" = 'region';
  `);

  await db.runSql(`
    ALTER TABLE "entity"
      ALTER COLUMN "code" TYPE VARCHAR(32),
      ALTER COLUMN "id" TYPE VARCHAR(32),
      ALTER COLUMN "parent_code" TYPE VARCHAR(32),
      ALTER COLUMN "region" TYPE GEOGRAPHY(POLYGON);
  `);

  await db.runSql(`
    UPDATE "entity"
      SET "parent_code" = ''
      WHERE "type" = 'facility';
  `);
};

exports._meta = {
  version: 1,
};
