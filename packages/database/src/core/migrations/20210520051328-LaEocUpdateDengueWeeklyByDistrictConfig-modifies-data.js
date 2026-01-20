'use strict';

import { updateValues } from '../utilities';

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

const reportId = 'LAOS_EOC_Dengue_Cases_By_Week_District';
const newMeasureBuilderConfig = {
  programCodes: ['NCLE_Communicable_Disease'],
  dataSourceType: 'custom',
  aggregationType: 'COUNT_PER_ORG_GROUP',
  dataElementCode: 'NCLE_Disease_Name',
  aggregationConfig: {
    condition: {
      value: ['7.1', '7.2', '7.3'],
      operator: 'in',
    },
  },
  entityAggregation: {
    aggregationOrder: 'BEFORE',
    dataSourceEntityType: 'facility',
    aggregationEntityType: 'sub_district',
  },
};

exports.up = function (db) {
  return updateValues(
    db,
    'mapOverlay',
    { measureBuilderConfig: newMeasureBuilderConfig },
    { id: reportId },
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
