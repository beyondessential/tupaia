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
  code: 'FluTracker_LGA_Percent_First_Nations_ILI',
  builder: 'analyticArithmetic',
  config: {
    formula:
      'firstExistingValue(FWV_LGA_ILI_Percentage_prior_March_2021, FWV_LGA_ILI_Percentage_Till_Current)',
    parameters: [
      {
        builder: 'analyticArithmetic',
        code: 'FWV_LGA_ILI_Percentage_prior_March_2021',
        config: {
          formula: 'FluTracking_NationalFNILI',
          aggregation: ['FINAL_EACH_DAY'],
        },
      },
      {
        builder: 'analyticArithmetic',
        code: 'FWV_LGA_ILI_Percentage_Till_Current',
        config: {
          formula:
            '(FWV_LGA_004a_Total_By_Country >= 0 and FWV_LGA_003a_Total_By_Country > 0) ? (FWV_LGA_004a_Total_By_Country / FWV_LGA_003a_Total_By_Country * 100) : 0',
          parameters: [
            // Sum up 'FWV_LGA_004a' per period in national level as 'FWV_LGA_004a_Total_By_Country'
            {
              builder: 'analyticArithmetic',
              code: 'FWV_LGA_004a_Total_By_Country',
              config: {
                formula: 'FWV_LGA_004a',
                aggregation: [
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
            // Sum up 'FWV_LGA_003a' per period in national level as 'FWV_LGA_003a_Total_By_Country'
            {
              builder: 'analyticArithmetic',
              code: 'FWV_LGA_003a_Total_By_Country',
              config: {
                formula: 'FWV_LGA_003a',
                aggregation: [
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
          ],
          aggregation: [],
          defaultValues: {
            FWV_LGA_004a_Total_By_Country: 'undefined',
            FWV_LGA_003a_Total_By_Country: 'undefined',
          },
        },
      },
    ],
    aggregation: {
      FWV_LGA_ILI_Percentage_prior_March_2021: 'FINAL_EACH_DAY',
      FWV_LGA_ILI_Percentage_Till_Current: 'FINAL_EACH_DAY',
    },
    defaultValues: {
      FWV_LGA_ILI_Percentage_prior_March_2021: 'undefined',
      FWV_LGA_ILI_Percentage_Till_Current: 'undefined',
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
