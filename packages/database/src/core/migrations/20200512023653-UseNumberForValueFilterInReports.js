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
    id: 'PG_Strive_PNG_Febrile_Cases_By_Age',
    path: ['dataClasses', 'Five years or older', 'denominator', 'dataValues', 'STR_CRF125'],
    oldValue: '"1"',
    newValue: 1,
  },
  {
    id: 'PG_Strive_PNG_Febrile_Cases_By_Age',
    path: ['dataClasses', 'Less than 5 years old', 'denominator', 'dataValues', 'STR_CRF125'],
    oldValue: '"1"',
    newValue: 1,
  },
  {
    id: 'PG_Strive_PNG_Febrile_Cases_By_Sex',
    path: ['dataClasses', 'Male', 'denominator', 'dataValues', 'STR_CRF125'],
    oldValue: '"1"',
    newValue: 1,
  },
  {
    id: 'PG_Strive_PNG_Febrile_Cases_By_Sex',
    path: ['dataClasses', 'Female', 'denominator', 'dataValues', 'STR_CRF125'],
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
