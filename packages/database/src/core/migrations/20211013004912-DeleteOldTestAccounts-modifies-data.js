'use strict';

import { arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

const testAccountEmails = [
  'andrewtest1@test.test',
  'andrewtest@test.test',
  'andrewtestmachine@test.test',
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
  const testAccounts = (
    await db.runSql(`
    SELECT id FROM user_account
    WHERE email IN (${arrayToDbString(testAccountEmails)});
  `)
  ).rows;

  testAccounts.forEach(testAccount => {
    return db.runSql(`
      DELETE FROM api_client WHERE user_account_id = '${testAccount.id}';
      DELETE FROM api_request_log WHERE user_id = '${testAccount.id}';
      DELETE FROM user_entity_permission WHERE user_id = '${testAccount.id}';
      DELETE FROM user_account WHERE id = '${testAccount.id}';
    `);
  });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
