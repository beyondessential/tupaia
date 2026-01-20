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

exports.up = function (db) {
  return db.runSql(`
    update "project"
    set "description" = 'FluTracking data, COVID-19 cases, deaths and testing'
    where "code" = 'covidau';
    
    update "entity"
    set "name" = 'FluTracking & COVID-19 Australia'
    where "code" = 'covidau';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
