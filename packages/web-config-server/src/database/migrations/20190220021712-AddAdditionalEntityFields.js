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

// the data is already present in files from a previous migration
const CK = require('../migrationData/20190222000003-AddFacilityEntities/CK.json');
const DL = require('../migrationData/20190222000003-AddFacilityEntities/DL.json');
const KI = require('../migrationData/20190222000003-AddFacilityEntities/KI.json');
const SB = require('../migrationData/20190222000003-AddFacilityEntities/SB.json');
const TK = require('../migrationData/20190222000003-AddFacilityEntities/TK.json');
const TO = require('../migrationData/20190222000003-AddFacilityEntities/TO.json');
const VU = require('../migrationData/20190222000003-AddFacilityEntities/VU.json');

const facilities = [
  ...CK.entities,
  ...DL.entities,
  ...KI.entities,
  ...SB.entities,
  ...TK.entities,
  ...TO.entities,
  ...VU.entities,
].filter(f => f.photoUrl);

exports.up = async function(db) {};

exports.up = async function(db) {
  await db.runSql(`
    ALTER TABLE "entity"
      ADD COLUMN "image_url" TEXT,
      ADD COLUMN "country_code" VARCHAR(6);

    CREATE INDEX idx_entity_country_code ON entity(country_code);

    UPDATE "entity"
      SET "country_code" = SUBSTRING("code" FROM 1 FOR 2);
  `);

  // populate image column with urls
  return Promise.all(
    facilities.map(f =>
      db.runSql(
        `
    UPDATE "entity"
      SET "image_url" = ?
      WHERE "code" = ?;
  `,
        [f.photoUrl, f.organisationUnitCode],
      ),
    ),
  );
};

exports.down = function(db) {
  return db.runSql(`
    DROP INDEX idx_entity_country_code;

    ALTER TABLE "entity"
      DROP COLUMN "image_url",
      DROP COLUMN "country_code";
  `);
};

exports._meta = {
  version: 1,
};
