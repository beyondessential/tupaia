'use strict';

var dbm;
var type;
var seed;

const reportsToUpdate = [
  'WS_COVID_Household_Vaccination_Status',
  'WS_Covid_Samoa_COVID-19_Percent_Of_Population_1st_Vaccine_Dose_Taken_Capped',
  'WS_Covid_Samoa_COVID-19_Percent_Of_Population_2nd_Vaccine_Dose_Taken_Capped',
  'WS_COVID_TRACKING_Dose_1_Home_Sub_District_Percentage_Capped_map',
  'WS_COVID_TRACKING_Dose_2_Home_Sub_District_Percentage_Capped_map',
  'WS_COVID_TRACKING_Dose_1_Home_Village_Percentage_Capped_map',
  'WS_COVID_TRACKING_Dose_2_Home_Village_Percentage_Capped_map',
];

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
  const selectNewPermissionId = await db.runSql(`
    SELECT id FROM permission_group WHERE name = 'COVID-19 Samoa';
  `);
  const [newPermission] = selectNewPermissionId.rows;
  const newPermissionId = newPermission.id;

  reportsToUpdate.forEach(async report => {
    await db.runSql(`
      UPDATE report
      SET permission_group_id = '${newPermissionId}'
      WHERE code = '${report}';
    `);
  });
};

exports.down = async function (db) {
  const selectOldPermissionId = await db.runSql(`
    SELECT id FROM permission_group WHERE name = 'COVID-19';
  `);
  const [oldPermission] = selectOldPermissionId.rows;
  const oldPermissionId = oldPermission.id;

  reportsToUpdate.forEach(async report => {
    await db.runSql(`
      UPDATE report
      SET permission_group_id = '${oldPermissionId}'
      WHERE code = '${report}';
    `);
  });
};

exports._meta = {
  version: 1,
};
