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

const projectCode = 'supplychain_fiji';

const oldImageUrl =
  'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/supplychain_fiji_background.png';

const newImageUrl =
  'https://tupaia.s3-ap-southeast-2.amazonaws.com/uploads/supplychain_fiji_background.jpg';

exports.up = function (db) {
  return db.runSql(`
      update "project" set "image_url" = '${newImageUrl}' where code = '${projectCode}'; 
    `);
};

exports.down = function (db) {
  return db.runSql(`
      update "project" set "image_url" = '${oldImageUrl}' where code = '${projectCode}'; 
  `);
};

exports._meta = {
  version: 1,
};
