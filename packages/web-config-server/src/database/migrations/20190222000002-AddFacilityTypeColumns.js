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

function makeTypeNameUpdate(categoryName, categoryCode, countryPrefix) {
  const prefixFilter = countryPrefix
    ? `AND SUBSTRING("code" from 1 for 2) = '${countryPrefix}'`
    : '';
  return `
    UPDATE "clinic"
      SET "type_name" = '${categoryName}'
      WHERE "type" = '${categoryCode}'
      ${prefixFilter};
  `;
}

exports.up = function(db) {
  return db.runSql(`
    ALTER TABLE "clinic"
      ADD COLUMN "category_code" VARCHAR(3),
      ADD COLUMN "type_name" VARCHAR(30);

    UPDATE "clinic"
      SET "category_code" = SUBSTRING("type" from 1 for 1)
      WHERE "type" IS NOT NULL;

    ${makeTypeNameUpdate('Hospital', '1')}
    ${makeTypeNameUpdate('Community health centre', '2')}
    ${makeTypeNameUpdate('Clinic', '3')}
    ${makeTypeNameUpdate('Aid post', '4')}

    ${makeTypeNameUpdate('Medical warehouse', '1.1', 'TO')}
    ${makeTypeNameUpdate('Extended CHC', '2.1', 'TO')}
    ${makeTypeNameUpdate('Remote CHC', '2.2', 'TO')}
    ${makeTypeNameUpdate('Mobile RHC', '3.1', 'TO')}
    ${makeTypeNameUpdate('Other', '4.1', 'TO')}

    ${makeTypeNameUpdate('Storage', '1.1', 'VU')}
    ${makeTypeNameUpdate('Dispensary', '3.1', 'VU')}
    ${makeTypeNameUpdate('Other', '4.1', 'VU')}
    ${makeTypeNameUpdate('Provincial administration', '4.2', 'VU')}
    ${makeTypeNameUpdate('National administration', '4.3', 'VU')}
    ${makeTypeNameUpdate('Health centre', '2', 'VU')}
  `);
};

exports.down = function(db) {
  return db.runSql(`
    ALTER TABLE "clinic"
      DROP COLUMN "category_code",
      DROP COLUMN "type_name";
  `);
};

exports._meta = {
  version: 1,
};
