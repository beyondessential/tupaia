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
      name VARCHAR(40) NOT NULL,
      url_segment TEXT NOT NULL,
      image_url TEXT,
      logo_url TEXT,
      primary_hexcode TEXT,
      secondary_hexcode TEXT,
      extended_title TEXT,
      long_bio TEXT,
      contact_us TEXT,
      external_link TEXT,
      phone_number TEXT,
      website_url TEXT,
      include_name_in_header BOOLEAN,
      project_codes TEXT[]
    )
  `);
};

exports.down = async function (db) {
  await db.runSql(`DROP TABLE landing_page`);
};

exports._meta = {
  version: 1,
};
