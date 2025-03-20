'use strict';

import { insertObject } from '../utilities/migration';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
const REPORT = {
  id: 'PG_Strive_PNG_K13_PCR_Results',
  dataBuilder: 'composeDataPerOrgUnit',
  dataBuilderConfig: {
    dataBuilders: {
      other: {
        dataBuilder: 'countEvents',
        dataBuilderConfig: {
          entityAggregation: {
            dataSourceEntityType: 'village',
            aggregationEntityType: 'facility',
          },
          dataValues: {
            STR_K13C07: {
              value: 'other',
              operator: 'regex',
            },
          },
          groupBy: {
            type: 'allOrgUnitNames',
            options: {
              type: 'facility',
              parentCode: '{organisationUnitCode}',
            },
          },
          programCode: 'SK13C',
        },
      },
      wildtype: {
        dataBuilder: 'countEvents',
        dataBuilderConfig: {
          entityAggregation: {
            dataSourceEntityType: 'village',
            aggregationEntityType: 'facility',
          },
          dataValues: {
            STR_K13C07: {
              value: 'wildtype',
              operator: 'regex',
            },
          },
          groupBy: {
            type: 'allOrgUnitNames',
            options: {
              type: 'facility',
              parentCode: '{organisationUnitCode}',
            },
          },
          programCode: 'SK13C',
        },
      },
      C580Y: {
        dataBuilder: 'countEvents',
        dataBuilderConfig: {
          entityAggregation: {
            dataSourceEntityType: 'village',
            aggregationEntityType: 'facility',
          },
          dataValues: {
            STR_K13C07: {
              value: 'C580Y',
              operator: 'regex',
            },
          },
          groupBy: {
            type: 'allOrgUnitNames',
            options: {
              type: 'facility',
              parentCode: '{organisationUnitCode}',
            },
          },
          programCode: 'SK13C',
        },
      },
    },
  },
  viewJson: {
    name: 'K13 PCR Results',
    type: 'chart',
    chartType: 'bar',
    chartConfig: {
      other: {
        stackId: 1,
      },
      C580Y: {
        stackId: 2,
      },
      wildtype: {
        stackId: 3,
      },
    },
    // periodGranularity: 'one_week_at_a_time',
    presentationOptions: {
      hideAverage: true,
    },
  },
};
const DASHBOARD_GROUP_CODE = 'PG_Strive_PNG_Country';

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);
  await db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT.id}')
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
