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
    alter table "project"
    add column "entity_hierarchy_id" text,
    add foreign key ("entity_hierarchy_id") references "entity_hierarchy"("id");
  `);

  const projectCodes = (await db.runSql(`select code from project;`)).rows;
  for (const { code } of projectCodes) {
    const hierarchy_id = (await db.runSql(`select id from entity_hierarchy where name = '${code}'`))
      .rows[0].id;

    await db.runSql(`
      update project set "entity_hierarchy_id" = '${hierarchy_id}' where code = '${code}';
    `);
  }

  return null;
};

exports.down = function (db) {
  return db.runSql(`
    alter table "project" drop column "entity_hierarchy_id";
  `);
};

exports._meta = {
  version: 1,
};
