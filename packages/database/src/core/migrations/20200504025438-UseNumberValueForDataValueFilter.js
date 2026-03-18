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

const updateDataBuilderConfigValue = (db, { id, path, value }) =>
  db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig"= jsonb_set(
        "dataBuilderConfig",
        '{${path}}',
        '${value}'
      )
    WHERE id = '${id}';
`);

const REPORT_CONFIG_CHANGES = [
  {
    id: 'PG_Strive_PNG_Weekly_Number_of_Febrile_Cases',
    path: [
      'dataBuilders',
      'mRDT',
      'dataBuilderConfig',
      'dataClasses',
      'mRDT',
      'denominator',
      'dataValues',
      'STR_CRF165',
    ],
    oldValue: '"1"',
    newValue: 1,
  },
  {
    id: 'PG_Strive_PNG_Weekly_mRDT_Positive',
    path: ['dataClasses', 'value', 'denominator', 'dataValues', 'STR_CRF165'],
    oldValue: '"1"',
    newValue: 1,
  },
];

exports.up = async function (db) {
  return Promise.all(
    REPORT_CONFIG_CHANGES.map(({ id, path, newValue }) =>
      updateDataBuilderConfigValue(db, { id, path, value: newValue }),
    ),
  );
};

exports.down = async function (db) {
  return Promise.all(
    REPORT_CONFIG_CHANGES.map(({ id, path, oldValue }) =>
      updateDataBuilderConfigValue(db, { id, path, value: oldValue }),
    ),
  );
};

exports._meta = {
  version: 1,
};
