'use strict';

import { generateId } from '../utilities/generateId';

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
  INSERT INTO "data_source" ("id", "code", "type", "service_type", "config")
  VALUES (
    '${generateId()}',
    'HP35n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false, "dataElementCode": "Age"}'
  );

  INSERT INTO "data_source" ("id", "code", "type", "service_type", "config")
  VALUES (
    '${generateId()}',
    'HP36n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false, "dataElementCode": "Gender"}'
  );
  `)
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
