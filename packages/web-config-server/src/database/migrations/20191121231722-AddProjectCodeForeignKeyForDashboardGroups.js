'use strict';

var dbm;
var type;
var seed;

import { generateId } from '@tupaia/database';

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
    INSERT INTO "project" ("id", "code", "name", "user_group", "entity_ids")
    VALUES (
      '${generateId()}',
      'explore',
      'General',
      'Public',
      '{"5d3f8844a72aa231bf71977f"}'
    );

    INSERT INTO "project" ("id", "code", "user_group", "name", "description", "sort_order", "theme", "entity_ids")
    VALUES (
      '${generateId()}',
      'disaster',
      'Public',
      'Disaster Response',
      'View active disasters across the Pacific and access country specific resources.',
      '0',
      '{"text": "#ffffff", "background": "#C82E2E"}',
      '{"5d3f8844a72aa231bf71977f"}'
    );
  `);

  await db.runSql(`
    ALTER TABLE "dashboardGroup"
    RENAME COLUMN "project" TO "projectCode";
  `);

  return db.runSql(`
    ALTER TABLE "dashboardGroup"
    ADD FOREIGN KEY ("projectCode") REFERENCES "project"("code");
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
