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

const INDICATORS = [
  {
    id: generateId(),
    code: 'FluTracker_LGA_Percent_First_Nations_ILI',
    builder: 'analyticArithmetic',
    config: {
      formula: 'firstExistingValue(FWV_LGA_ILI_Percentage_prior_2018, FWV_LGA_ILI_Percentage)',
      parameters: [
        {
          builder: 'analyticArithmetic',
          code: 'FWV_LGA_ILI_Percentage_prior_2018',
          config: {
            formula: 'FluTracking_NationalFNILI',
            aggregation: [
              {
                type: 'FINAL_EACH_DAY',
                config: {
                  dataSourceEntityType: 'country',
                },
              },
            ],
          },
        },
        {
          builder: 'analyticArithmetic',
          code: 'FWV_LGA_ILI_Percentage',
          config: {
            formula: 'FWV_LGA_004a / FWV_LGA_003a',
            aggregation: [
              {
                type: 'FINAL_EACH_DAY',
                config: {
                  dataSourceEntityType: 'sub_district',
                  aggregationEntityType: 'requested',
                },
              },
            ],
          },
        },
      ],
      aggregation: {
        FWV_LGA_ILI_Percentage_prior_2018: 'FINAL_EACH_DAY',
        FWV_LGA_ILI_Percentage: 'FINAL_EACH_DAY',
      },
      defaultValues: {
        FWV_LGA_ILI_Percentage_prior_2018: 'undefined', // to differentiate between no data and 0
        FWV_LGA_ILI_Percentage: 'undefined',
      },
    },
  },
];

exports.up = async function (db) {
  for (const indicator of INDICATORS) {
    await insertObject(db, 'indicator', indicator);
    await insertObject(db, 'data_source', {
      id: generateId(),
      code: indicator.code,
      type: 'dataElement',
      service_type: 'indicator',
    });
  }
};

exports.down = async function (db) {
  for (const indicator of INDICATORS) {
    await deleteObject(db, 'indicator', { code: indicator.code });
    await deleteObject(db, 'data_source', { code: indicator.code });
  }
};

exports._meta = {
  version: 1,
};
