'use strict';

import { arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

const REPORT_IDS = [
  'Laos_Schools_MoES_Users_Percent_School',
  'Laos_Schools_Primary_Standardised_Tests_School',
];

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" 
    WHERE id IN (${arrayToDbString(REPORT_IDS)})
  `);

  // Just a bit of safety
  const reportsUsingDeletedDatabuilder = await db.runSql(
    `SELECT id FROM "dashboardReport" WHERE "dataBuilder" = 'composeSinglePercentage'`,
  );
  if (reportsUsingDeletedDatabuilder.rows.length > 0) {
    throw new Error(`There's a merge conflict!`);
  }
};

exports.down = function(db) {
  // No down migration
};

exports._meta = {
  version: 1,
};
