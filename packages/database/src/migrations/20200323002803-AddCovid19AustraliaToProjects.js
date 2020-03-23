'use strict';

var dbm;
var type;
var seed;

var _database = require('@tupaia/database');
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
  const australia = await db.runSql(`select id from entity where code = 'AU'`);

  await db.runSql(`
    UPDATE "project"
    sort_order = 2
    WHERE code = 'unfpa';
  `);

  return db.runSql(`
    INSERT INTO project (id, code, entity_ids, name, description, sort_order, image_url, user_groups, logo_url)
    VALUES (
      '${(0, _database.generateId)()}',
      'covidau',
      '{${australia.rows[0].id}}',
      'COVID-19 Australia',
      'Confirmed cases, deaths, facility locations, estimated ICU capacity',
      '1',
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/covidau_background.jpg',
      '{Public}',
      'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/covidau_logo.png'
    );
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
