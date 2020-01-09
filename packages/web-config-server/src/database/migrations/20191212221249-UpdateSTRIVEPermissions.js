'use strict';

import { generateId } from '@tupaia/database';

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

const superUserID = generateId();

exports.up = function(db) {
  return db.runSql(`

    INSERT INTO
      "permission_group" ("id", "name", "parent_id")
     VALUES
      (
        '${superUserID}',
        'STRIVE Super User',
        '59085f2dfc6a0715dae508e3'
      );

    UPDATE "permission_group"
      SET "name" = 'STRIVE User'
        WHERE "id" = '5ca56d61f013d605ac1e3a32';

    UPDATE "permission_group"
      SET "parent_id" = '${superUserID}'
        WHERE "id" = '5ca56d61f013d605ac1e3a32';

    UPDATE "dashboardGroup"
      SET "userGroup" = 'STRIVE User'
        WHERE "id" = '65';

    UPDATE "dashboardGroup"
      SET "userGroup" = 'STRIVE Super User'
        WHERE "id" = '68';

    UPDATE "dashboardGroup"
      SET "userGroup" = 'STRIVE User'
        WHERE "id" = '66';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
