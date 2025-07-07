'use strict';

import { insertJsonEntry, updateJsonEntry, removeJsonEntry } from '../utilities';

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

const code = 'UNFPA_Monthly_5_Methods_of_Contraception_Regional';

exports.up = async function (db) {
  await updateJsonEntry(
    db,
    'dashboard_item',
    'config',
    [],
    { periodGranularity: 'year' },
    {
      code,
    },
  );

  await insertJsonEntry(
    db,
    'dashboard_item',
    'config',
    ['chartConfig', '$all'],
    { connectNulls: true },
    { code },
  );

  await updateJsonEntry(
    db,
    'legacy_report',
    'data_builder_config',
    [],
    { periodType: 'year' },
    {
      code,
    },
  );
};

exports.down = async function (db) {
  await updateJsonEntry(
    db,
    'dashboard_item',
    'config',
    [],
    { periodGranularity: 'quarter' },
    {
      code,
    },
  );
  await removeJsonEntry(db, 'dashboard_item', 'config', ['chartConfig', '$all'], 'connectNulls', {
    code,
  });
  await updateJsonEntry(
    db,
    'legacy_report',
    'data_builder_config',
    [],
    { periodType: 'quarter' },
    {
      code,
    },
  );
};

exports._meta = {
  version: 1,
};
