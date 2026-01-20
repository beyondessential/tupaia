'use strict';

import { insertObject } from '../utilities';

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

const DASHBOARD_GROUP_CODE = 'TO_Health_Promotion_Unit_Country';

const REPORT = {
  id: 'TO_HPU_Rate_Of_Tobacco_Non_Compliance_Country',
  dataBuilder: 'composePercentagesPerPeriod',
  dataBuilderConfig: {
    percentages: {
      value: {
        numerator: 'sumInspectionsWithTobaccoNonCompliance',
        denominator: 'sumRestrictedPublicAreasInspected',
      },
    },
    dataBuilders: {
      sumInspectionsWithTobaccoNonCompliance: {
        dataBuilder: 'sumPerPeriod',
        dataBuilderConfig: {
          dataClasses: {
            value: {
              codes: ['HP254', 'HP255', 'HP256', 'HP257', 'HP258', 'HP259', 'HP260', 'HP261'],
            },
          },
          aggregationType: 'SUM_EACH_YEAR',
        },
      },
      sumRestrictedPublicAreasInspected: {
        dataBuilder: 'sumPerPeriod',
        dataBuilderConfig: {
          dataClasses: {
            value: {
              codes: ['HP253'],
            },
          },
          aggregationType: 'SUM_EACH_YEAR',
        },
      },
    },
  },
  viewJson: {
    name: 'Rate of Tobacco Non-Compliance',
    type: 'chart',
    chartType: 'line',
    valueType: 'percentage',
    periodGranularity: 'year',
    labelType: 'fractionAndPercentage',
    chartConfig: {
      $all: {
        yAxisDomain: {
          max: {
            type: 'number',
            value: 1,
          },
          min: {
            type: 'number',
            value: 0,
          },
        },
      },
    },
  },
  dataServices: [
    {
      isDataRegional: false,
    },
  ],
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
