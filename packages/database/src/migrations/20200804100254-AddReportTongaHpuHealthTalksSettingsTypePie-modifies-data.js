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

// Dashboard Group | Health Promotion Unit
// Dashboard Title | Health Talks and Training: Setting Type, Tonga
// Dashboard type | Pie chart (Each section of the pie is a setting type (Church, workplace, school, community))
// Permission Group | Tonga Health Promotion Unit
// Countries | Tonga
// Hierarchy Level | National
// Survey: HP07 Monthly Training and Health Talks
// Yearly selector please.

// DataElement |  Answer Type |  Description
// HP281 Radio Setting
// Radio Options:
// Church
// Workplace
// School
// Community

const dashboardGroups = ['TO_Health_Promotion_Unit_Country'];
const reportId = 'TO_HPU_Health_Talk_Training_Setting_Type';
const dataBuilder = 'percentagesOfEventCounts';
const dataBuilderConfig = {
  dataClasses: {
    Church: {
      numerator: {
        dataValues: {
          HP281: 'Church',
        },
      },
      denominator: {
        dataValues: {
          HP281: '*',
        },
      },
    },
    School: {
      numerator: {
        dataValues: {
          HP281: 'School',
        },
      },
      denominator: {
        dataValues: {
          HP281: '*',
        },
      },
    },
    Community: {
      numerator: {
        dataValues: {
          HP281: 'Community',
        },
      },
      denominator: {
        dataValues: {
          HP281: '*',
        },
      },
    },
    Workplace: {
      numerator: {
        dataValues: {
          HP281: 'Workplace',
        },
      },
      denominator: {
        dataValues: {
          HP281: '*',
        },
      },
    },
  },
  programCode: 'HP07',
};
const viewJson = {
  name: 'Health Talks and Training: Setting Type',
  type: 'chart',
  chartType: 'pie',
  valueType: 'fractionAndPercentage',
  periodGranularity: 'one_year_at_a_time',
};

const dataServices = [{ isDataRegional: false }];

const report = {
  id: reportId,
  dataBuilder,
  dataBuilderConfig,
  viewJson,
  dataServices,
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', report);

  return db.runSql(`
     UPDATE "dashboardGroup"
     SET "dashboardReports" = "dashboardReports" || '{ ${report.id} }'
     WHERE "code" = '${dashboardGroups}';
   `);
};

exports.down = function (db) {
  return db.runSql(`
     DELETE FROM "dashboardReport" WHERE id = '${report.id}';

     UPDATE "dashboardGroup"
     SET "dashboardReports" = array_remove("dashboardReports", '${report.id}')
     WHERE "code" = '${dashboardGroups}';
   `);
};

exports._meta = {
  version: 1,
};
