'use strict';

import { insertObject } from '../utilities/migration';

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

const DASHBOARD_GROUP_CODE = 'PG_Strive_PNG_Country';
const REPORT = {
  id: 'PG_Strive_PNG_Weekly_Febrile_Illness_RDT_Positive_By_Facility_National',
  dataBuilder: 'composeDataPerOrgUnit',
  dataBuilderConfig: {
    dataBuilders: {
      '# RDT positive cases': {
        dataBuilder: 'countEvents',
        dataBuilderConfig: {
          groupBy: {
            type: 'allOrgUnitParentNames',
            options: {
              type: 'facility',
              parentCode: '{organisationUnitCode}',
              aggregationLevel: 'village',
            },
          },
          dataValues: {
            STR_CRF169: {
              value: 'Positive',
              operator: 'regex',
            },
          },
          periodType: 'week',
          programCode: 'SCRF',
        },
      },
      '# febrile illness cases': {
        dataBuilder: 'countEvents',
        dataBuilderConfig: {
          groupBy: {
            type: 'allOrgUnitParentNames',
            options: {
              type: 'facility',
              parentCode: '{organisationUnitCode}',
              aggregationLevel: 'village',
            },
          },
          dataValues: {
            STR_CRF125: 1,
          },
          periodType: 'week',
          programCode: 'SCRF',
        },
      },
    },
  },
  viewJson: {
    name: 'Weekly # of cases by health facility (all sites)',
    type: 'chart',
    chartType: 'bar',
    periodGranularity: 'one_week_at_a_time',
    chartConfig: {
      '# RDT positive cases': {
        stackId: 1,
      },
      '# febrile illness cases': {
        stackId: 2,
      },
    },

    presentationOptions: { hideAverage: true },
  },
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
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
