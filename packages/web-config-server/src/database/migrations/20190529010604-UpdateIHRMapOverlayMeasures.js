'use strict';

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

exports.up = function(db) {
  return db.runSql(`
  UPDATE "mapOverlay" SET "sortOrder" = 168.01 WHERE id = '174'; 
  UPDATE "mapOverlay" SET "sortOrder" = 168.02 WHERE id = '175'; 
  UPDATE "mapOverlay" SET "sortOrder" = 168.03 WHERE id = '176'; 
  UPDATE "mapOverlay" SET "sortOrder" = 168.04 WHERE id = '177'; 
  UPDATE "mapOverlay" SET "sortOrder" = 168.05 WHERE id = '178'; 
  UPDATE "mapOverlay" SET "sortOrder" = 168.06 WHERE id = '179'; 
  UPDATE "mapOverlay" SET "sortOrder" = 168.07 WHERE id = '180'; 
  UPDATE "mapOverlay" SET "sortOrder" = 168.08 WHERE id = '181'; 
  UPDATE "mapOverlay" SET "sortOrder" = 168.09 WHERE id = '182'; 
  UPDATE "mapOverlay" SET "sortOrder" = 168.10 WHERE id = '183'; 
  UPDATE "mapOverlay" SET "sortOrder" = 168.11 WHERE id = '184'; 
  UPDATE "mapOverlay" SET "sortOrder" = 168.12 WHERE id = '185'; 
  UPDATE "mapOverlay" SET "sortOrder" = 168.13 WHERE id = '186'; 
  UPDATE "mapOverlay" SET "sortOrder" = 168.14 WHERE id = '187'; 
  `);
};

exports.down = function(db) {
  return db.runSql(`
  UPDATE "mapOverlay" SET "sortOrder" = 168 WHERE id IN ('174', '175', '176', '177', '178', '179', '180', '181', '182', '183', '184', '185', '186', '187'); 
  `);
};

exports._meta = {
  "version": 1
};
