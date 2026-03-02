'use strict';

import { insertObject, generateId } from '../utilities';

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
const deleteObject = async (db, table, condition) => {
  const [key, value] = Object.entries(condition)[0];
  return db.runSql(`
      DELETE FROM "${table}"
      WHERE ${key} = '${value}'
  `);
};
const DATA_GROUP_CODE = 'NCLE_Communicable_Disease';
const DATA_ELEMENTS = [
  // Dengue Death
  {
    id: generateId(),
    code: 'Dengue_Fever_Without_Warning_Signs_Death',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'sIvaIybRqAY', isDataRegional: false, dhisDataType: 'ProgramIndicator' },
  },
  {
    id: generateId(),
    code: 'Dengue_Fever_With_Warning_Signs_Death',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'DsdYAsbsUUV', isDataRegional: false, dhisDataType: 'ProgramIndicator' },
  },
  {
    id: generateId(),
    code: 'Severe_Dengue_Death',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'Wae4PJ04C40', isDataRegional: false, dhisDataType: 'ProgramIndicator' },
  },
  // Dengue Case
  {
    id: generateId(),
    code: 'Dengue_Fever_Without_Warning_Signs_Case',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'Nk5PmEwUKeS', isDataRegional: false, dhisDataType: 'ProgramIndicator' },
  },
  {
    id: generateId(),
    code: 'Dengue_Fever_With_Warning_Signs_Case',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'hXTA4Ry7b9J', isDataRegional: false, dhisDataType: 'ProgramIndicator' },
  },
  {
    id: generateId(),
    code: 'Severe_Dengue_Case',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'UFvPeJ5pN0t', isDataRegional: false, dhisDataType: 'ProgramIndicator' },
  },
];

exports.up = async function (db) {
  const DATA_GROUP = (
    await db.runSql(`
    SELECT * from data_source 
    where code = '${DATA_GROUP_CODE}'
  `)
  ).rows[0];
  const DATA_ELEMENT_DATA_GROUP = {
    data_group_id: DATA_GROUP.id,
  };
  for (const dataElement of DATA_ELEMENTS) {
    await insertObject(db, 'data_source', dataElement);
    DATA_ELEMENT_DATA_GROUP.data_element_id = dataElement.id;
    DATA_ELEMENT_DATA_GROUP.id = generateId();
    await insertObject(db, 'data_element_data_group', DATA_ELEMENT_DATA_GROUP);
  }
};

exports.down = async function (db) {
  for (const dataElement of DATA_ELEMENTS) {
    await deleteObject(db, 'data_element_data_group', { data_element_id: dataElement.id });
    await deleteObject(db, 'data_source', { code: dataElement.code });
  }
};

exports._meta = {
  version: 1,
};
