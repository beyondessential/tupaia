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

exports.up = async function (db) {
  await db.runSql(`
    INSERT INTO "dashboardGroup"("code", "organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports")
    VALUES('Tonga_Communicable_Diseases_District', 'District', 'Tonga Communicable Diseases', 'TO', 'Communicable Diseases', '{}');
    
    INSERT INTO "dashboardGroup"("code", "organisationLevel", "userGroup", "organisationUnitCode", "name", "dashboardReports")
    VALUES('Tonga_Communicable_Diseases_National', 'Country', 'Tonga Communicable Diseases', 'TO', 'Communicable Diseases', '{}');
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardGroup"
    WHERE code = 'Tonga_Communicable_Diseases_District';

    DELETE FROM "dashboardGroup"
    WHERE code = 'Tonga_Communicable_Diseases_National';
  `);
};

exports._meta = {
  version: 1,
};
