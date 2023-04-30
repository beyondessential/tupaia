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
    CREATE TABLE landing_page (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url_segment TEXT NOT NULL,
      image_url TEXT,
      logo_url TEXT,
      primary_hexcode TEXT,
      secondary_hexcode TEXT,
      extended_title TEXT,
      long_bio TEXT,
      contact_us TEXT,
      external_link TEXT
    )
  `);
  await db.runSql(`
    CREATE TABLE landing_page_projects (
      id TEXT PRIMARY KEY,
      landing_page_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      FOREIGN KEY (landing_page_id) REFERENCES landing_page (id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES project (id) ON UPDATE CASCADE ON DELETE CASCADE
    )
  `);
};

exports.down = async function (db) {
  await db.runSql(`DROP_TABLE landing_page_projects`);
  await db.runSql(`DROP TABLE landing_page`);
};

exports._meta = {
  version: 1,
};
