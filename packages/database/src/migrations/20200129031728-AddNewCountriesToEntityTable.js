'use strict';

import { generateId } from '../utilities/generateId';

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

  INSERT INTO "entity" ("id", "code", "parent_id", "name", "type", "point", "region", "image_url", "country_code", "bounds", "metadata")
  VALUES (
    '${generateId()}',
    'NU',
    '5d3f8844a72aa231bf71977f',
    'Niue',
    'country',
    NULL,
    NULL,
    NULL,
    'NU',
    NULL,
    '{"dhis": {"isDataRegional": true}}'
  );

  INSERT INTO "entity" ("id", "code", "parent_id", "name", "type", "point", "region", "image_url", "country_code", "bounds", "metadata")
  VALUES (
    '${generateId()}',
    'PW',
    '5d3f8844a72aa231bf71977f',
    'Palau',
    'country',
    NULL,
    NULL,
    NULL,
    'PW',
    NULL,
    '{"dhis": {"isDataRegional": true}}'
  );

  INSERT INTO "entity" ("id", "code", "parent_id", "name", "type", "point", "region", "image_url", "country_code", "bounds", "metadata")
  VALUES (
    '${generateId()}',
    'TV',
    '5d3f8844a72aa231bf71977f',
    'Tuvalu',
    'country',
    NULL,
    NULL,
    NULL,
    'TV',
    NULL,
    '{"dhis": {"isDataRegional": true}}'
  );

  INSERT INTO "entity" ("id", "code", "parent_id", "name", "type", "point", "region", "image_url", "country_code", "bounds", "metadata")
  VALUES (
    '${generateId()}',
    'AS',
    '5d3f8844a72aa231bf71977f',
    'American Samoa',
    'country',
    NULL,
    NULL,
    NULL,
    'AS',
    NULL,
    '{"dhis": {"isDataRegional": true}}'
  );

  INSERT INTO "entity" ("id", "code", "parent_id", "name", "type", "point", "region", "image_url", "country_code", "bounds", "metadata")
  VALUES (
    '${generateId()}',
    'GU',
    '5d3f8844a72aa231bf71977f',
    'Guam',
    'country',
    NULL,
    NULL,
    NULL,
    'GU',
    NULL,
    '{"dhis": {"isDataRegional": true}}'
  );

  INSERT INTO "entity" ("id", "code", "parent_id", "name", "type", "point", "region", "image_url", "country_code", "bounds", "metadata")
  VALUES (
    '${generateId()}',
    'PF',
    '5d3f8844a72aa231bf71977f',
    'French Polynesia',
    'country',
    NULL,
    NULL,
    NULL,
    'PF',
    NULL,
    '{"dhis": {"isDataRegional": true}}'
  );

  INSERT INTO "entity" ("id", "code", "parent_id", "name", "type", "point", "region", "image_url", "country_code", "bounds", "metadata")
  VALUES (
    '${generateId()}',
    'NC',
    '5d3f8844a72aa231bf71977f',
    'New Caledonia',
    'country',
    NULL,
    NULL,
    NULL,
    'NC',
    NULL,
    '{"dhis": {"isDataRegional": true}}'
  );

  INSERT INTO "entity" ("id", "code", "parent_id", "name", "type", "point", "region", "image_url", "country_code", "bounds", "metadata")
  VALUES (
    '${generateId()}',
    'MP',
    '5d3f8844a72aa231bf71977f',
    'Northern Mariana Islands',
    'country',
    NULL,
    NULL,
    NULL,
    'MP',
    NULL,
    '{"dhis": {"isDataRegional": true}}'
  );

  INSERT INTO "entity" ("id", "code", "parent_id", "name", "type", "point", "region", "image_url", "country_code", "bounds", "metadata")
  VALUES (
    '${generateId()}',
    'PI',
    '5d3f8844a72aa231bf71977f',
    'Pitcairn Islands',
    'country',
    NULL,
    NULL,
    NULL,
    'PI',
    NULL,
    '{"dhis": {"isDataRegional": true}}'
  );

  INSERT INTO "entity" ("id", "code", "parent_id", "name", "type", "point", "region", "image_url", "country_code", "bounds", "metadata")
  VALUES (
    '${generateId()}',
    'WF',
    '5d3f8844a72aa231bf71977f',
    'Wallis and Futuna',
    'country',
    NULL,
    NULL,
    NULL,
    'WF',
    NULL,
    '{"dhis": {"isDataRegional": true}}'
  );

`);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
