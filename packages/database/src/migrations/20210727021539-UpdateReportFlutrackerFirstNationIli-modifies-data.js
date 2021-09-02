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
  code: 'FluTracker_Percent_First_Nations_ILI',
  builder: 'analyticArithmetic',
  config: {
    formula:
      "firstExistingValue(FluTracking_NationalFNILI == -1 ? 'undefined': FluTracking_NationalFNILI / 100, ((FWV_PC_003a == 0 or FWV_PC_004a == -1 or FWV_PC_003a == -1) ? 'undefined': FWV_PC_004a / FWV_PC_003a))",
    aggregation: {
      FluTracking_NationalFNILI: 'FINAL_EACH_WEEK',
      FWV_PC_003a: [
        'FINAL_EACH_WEEK',
        {
          type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
          config: {
            dataSourceEntityType: 'postcode',
            aggregationEntityType: 'country',
          },
        },
      ],
      FWV_PC_004a: [
        'FINAL_EACH_WEEK',
        {
          type: 'SUM_PER_PERIOD_PER_ORG_GROUP',
          config: {
            dataSourceEntityType: 'postcode',
            aggregationEntityType: 'country',
          },
        },
      ],
    },
    defaultValues: {
      FluTracking_NationalFNILI: -1,
      FWV_PC_003a: -1,
      FWV_PC_004a: -1,
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
