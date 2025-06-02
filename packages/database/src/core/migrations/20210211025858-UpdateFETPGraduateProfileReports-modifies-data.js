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
const reports = [
  {
    id: 'FETP_PG_graduate_number_of_outbreaks',
    newConfig: {
      dataBuilder: 'analytics',
      dataBuilderConfig: {
        dataElementCodes: ['FETPNG20Data_038'],
        entityAggregation: {
          dataSourceEntityType: 'individual',
        },
      },
    },
  },
  {
    id: 'FETP_PG_graduate_number_of_outbreaks_lead',
    newConfig: {
      dataBuilder: 'analytics',
      dataBuilderConfig: {
        dataElementCodes: ['FETPNG20Data_039'],
        entityAggregation: {
          dataSourceEntityType: 'individual',
        },
      },
    },
  },
  {
    id: 'FETP_PG_graduate_area_of_expertise',
    newConfig: {
      dataBuilder: 'nonMatrixTableFromCells',
      dataBuilderConfig: {
        rows: ['Areas of Expertise'],
        cells: [
          [
            {
              key: 'Area_Of_Expertise',
              operator: 'COMBINE_BINARY_AS_STRING',
              dataElementToString: {
                FETPNG20Data_012: 'Animal health',
                FETPNG20Data_013: 'Community engagement',
                FETPNG20Data_014: 'Data analysis',
                FETPNG20Data_015: 'Data management',
                FETPNG20Data_016: 'Environmental health',
                FETPNG20Data_017: 'EPI',
                FETPNG20Data_018: 'HIV',
                FETPNG20Data_019: 'Lab',
                FETPNG20Data_020: 'Malaria',
                FETPNG20Data_021: 'MCH',
                FETPNG20Data_022: 'NCDs',
                FETPNG20Data_023: 'NTD',
                FETPNG20Data_024: 'Operational research',
                FETPNG20Data_025: 'Other research',
                FETPNG20Data_026: 'Outbreak response',
                FETPNG20Data_027: 'Surveillance',
                FETPNG20Data_028: 'TB',
                FETPNG20Data_029: 'Team leadership',
                FETPNG20Data_030: 'Other',
              },
            },
          ],
        ],
        columns: ['main'],
        entityAggregation: {
          dataSourceEntityType: 'individual',
        },
      },
    },
  },
];

exports.up = async function (db) {
  await Promise.all(
    reports.map(report => updateValues(db, 'dashboardReport', report.newConfig, { id: report.id })),
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
