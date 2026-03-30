'use strict';

import { deleteObject, generateId, insertObject } from '../utilities';

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

const INDICATOR = {
  id: generateId(),
  code: 'FluTracker_LGA_Percent_Non_First_Nations_ILI',
  builder: 'analyticArithmetic',
  config: {
    formula: "FWV_LGA_003b == 0 ? 'undefined' : FWV_LGA_004b / FWV_LGA_003b",
    aggregation: {
      FWV_LGA_003b: [
        'FINAL_EACH_DAY',
        {
          type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
          config: {
            dataSourceEntityType: 'sub_district',
            aggregationEntityType: 'country',
          },
        },
      ],
      FWV_LGA_004b: [
        'FINAL_EACH_DAY',
        {
          type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
          config: {
            dataSourceEntityType: 'sub_district',
            aggregationEntityType: 'country',
          },
        },
      ],
    },
  },
};

exports.up = async function (db) {
  await insertObject(db, 'indicator', INDICATOR);
  await insertObject(db, 'data_source', {
    id: generateId(),
    code: INDICATOR.code,
    type: 'dataElement',
    service_type: 'indicator',
  });
};

exports.down = async function (db) {
  await deleteObject(db, 'indicator', { code: INDICATOR.code });
  await deleteObject(db, 'data_source', { code: INDICATOR.code });
};

exports._meta = {
  version: 1,
};
