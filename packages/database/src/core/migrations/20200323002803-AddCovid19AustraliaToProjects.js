'use strict';

var dbm;
var type;
var seed;

const { generateId } = require('../utilities/generateId');

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
  const australia = await db.runSql(`select id from entity where code = 'AU'`);
  if (australia.rows.length === 0) {
    throw new Error('Please import Australia first!');
  }

  await db.runSql(`
  UPDATE "project" SET "sort_order"=2 WHERE "code"='unpa';

  `);

  return db.runSql(`
    INSERT INTO project (id, code, entity_ids, name, description, sort_order, image_url, user_groups, logo_url)
    VALUES (
      '${generateId()}',
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

exports.down = async function (db) {
  await db.runSql(`UPDATE "project" SET sort_order=1 WHERE "code"='unfpa';`);
  return db.runSql(`DELETE FROM "project" WHERE "code"='covidau';`);
};

exports._meta = {
  version: 1,
};
