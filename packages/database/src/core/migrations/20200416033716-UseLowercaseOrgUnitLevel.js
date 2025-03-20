'use strict';

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

const updateOrgUnitLevel = async (db, newValue) =>
  db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || jsonb_build_object('organisationUnitLevel', ${newValue})
    WHERE "dataBuilderConfig" ? 'organisationUnitLevel';
  `);

exports.up = async function (db) {
  await updateOrgUnitLevel(db, `LOWER("dataBuilderConfig"->>'organisationUnitLevel')`);
};

exports.down = async function (db) {
  await updateOrgUnitLevel(db, `INITCAP("dataBuilderConfig"->>'organisationUnitLevel')`);
};

exports._meta = {
  version: 1,
};
