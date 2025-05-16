'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const PREFIX_TO_SERVER_LIST = {
  CD: 'tonga',
  CH: 'tonga',
  De: 'tonga',
  FP: 'tonga',
  Fa: 'tonga',
  HP: 'tonga',
  IM: 'tonga',
  LA: 'lao-peoples-democratic-republic',
  MA: 'lao-peoples-democratic-republic',
  MC: 'tonga',
  Ma: 'lao-peoples-democratic-republic',
  Me: 'lao-peoples-democratic-republic',
  NC: 'lao-peoples-democratic-republic',
  PO: 'tonga',
  PW: 'palau',
  SO: 'lao-peoples-democratic-republic',
};

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const DHIS_INSTANCE_CODE_JSONPATH = '{dhisInstanceCode}';
const prefixListKeyValuePairs = Object.entries(PREFIX_TO_SERVER_LIST);

exports.up = async function (db) {
  for (const [prefix, server] of prefixListKeyValuePairs) {
    await db.runSql(`
    UPDATE "data_group"
    SET "config" = jsonb_set("config", '${DHIS_INSTANCE_CODE_JSONPATH}', '"${server}"')
    WHERE (config->'dhisInstanceCode') is not null AND (config->>'dhisInstanceCode') is null AND substring(code from 1 for 2) = '${prefix}';
    `);

    await db.runSql(`
    UPDATE "data_element"
    SET "config" = jsonb_set("config", '${DHIS_INSTANCE_CODE_JSONPATH}', '"${server}"')
    WHERE (config->'dhisInstanceCode') is not null AND (config->>'dhisInstanceCode') is null AND substring(code from 1 for 2) = '${prefix}';
    `);
  }
};

exports.down = async function (db) {
  for (const [prefix, server] of prefixListKeyValuePairs) {
    await db.runSql(`
    UPDATE "data_group"
    SET "config" = jsonb_set("config", '${DHIS_INSTANCE_CODE_JSONPATH}', 'null')
    WHERE (config->'dhisInstanceCode') is not null AND (config->>'dhisInstanceCode') = '${server}' AND substring(code from 1 for 2) = '${prefix}';
    `);

    await db.runSql(`
    UPDATE "data_element"
    SET "config" = jsonb_set("config", '${DHIS_INSTANCE_CODE_JSONPATH}', 'null')
    WHERE (config->'dhisInstanceCode') is not null AND (config->>'dhisInstanceCode') = '${server}' AND substring(code from 1 for 2) = '${prefix}';
    `);
  }
};

exports._meta = {
  version: 1,
};
