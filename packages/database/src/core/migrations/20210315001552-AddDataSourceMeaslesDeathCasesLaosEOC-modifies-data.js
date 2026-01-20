'use strict';

import { insertObject, generateId, deleteObject } from '../utilities';

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
const DATA_GROUP = {
  id: generateId(),
  code: 'Measles_Case_Reporting',
  type: 'dataGroup',
  service_type: 'dhis',
  config: { dhisId: 'h6x4kyzKyK3', isDataRegional: false },
};

const DATA_ELEMENTS = [
  {
    id: generateId(),
    code: 'Total_Measles_Deaths',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'KYZmYsrNNTs', isDataRegional: false, dhisDataType: 'ProgramIndicator' },
  },
  {
    id: generateId(),
    code: 'Total_Positive_Measles_Cases',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'XIQnLHxsYha', isDataRegional: false, dhisDataType: 'ProgramIndicator' },
  },
];

const DATA_ELEMENT_DATA_GROUP = {
  data_group_id: DATA_GROUP.id,
};

exports.up = async function (db) {
  await insertObject(db, 'data_source', DATA_GROUP);
  for (const dataElement of DATA_ELEMENTS) {
    await insertObject(db, 'data_source', dataElement);
    DATA_ELEMENT_DATA_GROUP.data_element_id = dataElement.id;
    DATA_ELEMENT_DATA_GROUP.id = generateId();
    await insertObject(db, 'data_element_data_group', DATA_ELEMENT_DATA_GROUP);
  }
};

exports.down = async function (db) {
  await deleteObject(db, 'data_source', { code: DATA_GROUP.code });
  for (const dataElement of DATA_ELEMENTS) {
    await deleteObject(db, 'data_source', { code: dataElement.code });
  }
  await deleteObject(db, 'data_source', { code: DATA_GROUP.code });
};

exports._meta = {
  version: 1,
};
