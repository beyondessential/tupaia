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
  VALUES 
  (
    '${generateId()}',
    'HP35n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false, "dataElementCode": "Age"}'
  ),
  (
    '${generateId()}',
    'HP36n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false, "dataElementCode": "Gender"}'
  ),
  (
    '${generateId()}',
    'HP31n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${generateId()}',
    'HP32n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${generateId()}',
    'HP33n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${generateId()}',
    'HP34n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${generateId()}',
    'HP30n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${generateId()}',
    'HP45n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${generateId()}',
    'HP65n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${generateId()}',
    'HP75n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${generateId()}',
    'HP115n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${generateId()}',
    'HP135n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${generateId()}',
    'HP155n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${generateId()}',
    'HP165n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${generateId()}',
    'HP175n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${generateId()}',
    'HP195n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  ),
  (
    '${generateId()}',
    'HP_KnownYes1n',
    'dataElement',
    'dhis',
    '{"isDataRegional": false}'
  );
  `)
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
