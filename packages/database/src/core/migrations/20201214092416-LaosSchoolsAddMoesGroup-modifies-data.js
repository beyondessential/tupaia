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

exports.up = function (db) {
  return db.runSql(`
    insert into "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name", "code", "projectCodes")
    values
    ('Country', 'Laos Schools Super User', 'LA', '{Laos_Schools_Language_Of_Students}', 'MoES View', 'LA_Laos_Schools_Country_Laos_Schools_Super_User', '{laos_schools}'),
    ('District', 'Laos Schools Super User', 'LA', '{Laos_Schools_Language_Of_Students}', 'MoES View', 'LA_Laos_Schools_Province_Laos_Schools_Super_User', '{laos_schools}'),
    ('SubDistrict', 'Laos Schools Super User', 'LA', '{Laos_Schools_Language_Of_Students}', 'MoES View', 'LA_Laos_Schools_District_Laos_Schools_Super_User', '{laos_schools}'),
    ('School', 'Laos Schools Super User', 'LA', '{Laos_Schools_Language_Of_Students}', 'MoES View', 'LA_Laos_Schools_School_Laos_Schools_Super_User', '{laos_schools}');
  `);
};

exports.down = function (db) {
  return db.runSql(` delete from "dashboardGroup" where name = 'MoES View'; `);
};

exports._meta = {
  version: 1,
};
