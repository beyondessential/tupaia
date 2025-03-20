'use strict';

const { generateId, insertObject } = require('../utilities');

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

const DATA_GROUPS = [
  {
    code: 'FRIDGE_BREACH_PREAGGREGATED',
    service_type: 'dhis',
    config: { isDataRegional: true },
    dataElements: [
      'BREACH_TEMP',
      'BREACH_SOH_VALUE',
      'BREACH_START_TIME',
      'BREACH_END_TIME',
      'BREACH_MINS',
    ],
  },
];

const insertDataGroup = async (db, dataGroup) => {
  const { dataElements, ...groupFields } = dataGroup;

  const dataGroupId = generateId();
  await insertObject(db, 'data_source', {
    id: dataGroupId,
    ...groupFields,
    type: 'dataGroup',
  });
  for (const dataElementCode of dataElements) {
    await db.runSql(`
      INSERT INTO data_element_data_group
      SELECT generate_object_id(), id as data_element_id, '${dataGroupId}' FROM data_source
      WHERE type = 'dataElement' AND code = '${dataElementCode}';
    `);
  }
};

exports.up = async function (db) {
  for (const dataGroup of DATA_GROUPS) {
    await insertDataGroup(db, dataGroup);
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
