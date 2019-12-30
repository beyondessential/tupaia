'use strict';

import { insertObject } from '../migrationUtilities';

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

const addCommunicableDiseasesDashboard = async (db, ouCode, code) =>
  insertObject(db, 'dashboardGroup', {
    organisationLevel: 'Facility',
    userGroup: 'Tonga Communicable Diseases',
    organisationUnitCode: ouCode,
    dashboardReports: {},
    name: 'Communicable Diseases Validation',
    code: code,
  });

exports.up = async function(db) {
  await addCommunicableDiseasesDashboard(db, 'TO', 'TO_Communicable_Diseases_Validation');
  return addCommunicableDiseasesDashboard(db, 'DL', 'DL_Communicable_Diseases_Validation');
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM
      "dashboardGroup"
    WHERE
      "code" IN ('TO_Communicable_Diseases_Validation', 'DL_Communicable_Diseases_Validation');
  `);
};

exports._meta = {
  version: 1,
};
