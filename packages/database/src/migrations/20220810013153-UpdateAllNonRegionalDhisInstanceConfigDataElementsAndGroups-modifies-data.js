'use strict';

import { updateValues } from '../utilities';

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
  LA: 'laos',
  MA: 'laos',
  MC: 'tonga',
  Ma: 'laos',
  Me: 'laos',
  NC: 'laos',
  PO: 'tonga',
  PW: 'palau',
  SO: 'laos',
};

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const DHIS_INSTANCE_CODE_JSONPATH = '{dhisInstanceCode}';

exports.up = async function (db) {
  const prefixListKeyValuePairs = Object.entries(PREFIX_TO_SERVER_LIST);

  for (const [prefix, server] of prefixListKeyValuePairs) {
    await db.runSql(`
    UPDATE "data_group"
    SET "config" = jsonb_set("config", '${DHIS_INSTANCE_CODE_JSONPATH}', '"${server}"')
    WHERE substring(code from 1 for 2) = '${prefix}';
    `);

    await db.runSql(`
    UPDATE "data_element"
    SET "config" = jsonb_set("config", '${DHIS_INSTANCE_CODE_JSONPATH}', '"${server}"')
    WHERE substring(code from 1 for 2) = '${prefix}';
    `);
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
