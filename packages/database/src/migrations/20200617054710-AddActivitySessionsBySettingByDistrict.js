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

const CHURCH = 'Church';
const WORKPLACE = 'Workplace';
const SCHOOL = 'School';
const COMMUNITY = 'Community';

const DATA_ELEMENT = 'HP4';

const DASHBOARD_GROUP_CODE = 'TO_Health_Promotion_Unit_Country';

const BASE_SUB_BUILDER_CONFIG = {
  groupBy: {
    type: 'allOrgUnitNames',
    options: {
      type: 'district',
      parentCode: '{organisationUnitCode}',
    },
  },
  entityAggregation: {
    dataSourceEntityType: 'village',
    aggregationEntityType: 'district',
    aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
  },
  periodType: 'year',
  programCode: 'HP01',
};

const REPORT = {
  id: 'TO_HPU_Activity_Sessions_By_Setting_By_District',
  dataBuilder: 'composeDataPerOrgUnit',
  dataBuilderConfig: {
    dataBuilders: {
      [CHURCH]: {
        dataBuilder: 'countEvents',
        dataBuilderConfig: {
          ...BASE_SUB_BUILDER_CONFIG,
          dataValues: {
            [DATA_ELEMENT]: CHURCH,
          },
        },
      },
      [WORKPLACE]: {
        dataBuilder: 'countEvents',
        dataBuilderConfig: {
          ...BASE_SUB_BUILDER_CONFIG,
          dataValues: {
            [DATA_ELEMENT]: WORKPLACE,
          },
        },
      },
      [SCHOOL]: {
        dataBuilder: 'countEvents',
        dataBuilderConfig: {
          ...BASE_SUB_BUILDER_CONFIG,
          dataValues: {
            [DATA_ELEMENT]: SCHOOL,
          },
        },
      },
      [COMMUNITY]: {
        dataBuilder: 'countEvents',
        dataBuilderConfig: {
          ...BASE_SUB_BUILDER_CONFIG,
          dataValues: {
            [DATA_ELEMENT]: COMMUNITY,
          },
        },
      },
    },
  },
  viewJson: {
    name: 'Number of physical activity sessions by setting type',
    type: 'chart',
    chartType: 'bar',
    periodGranularity: 'one_year_at_a_time',
    chartConfig: {
      [CHURCH]: {
        stackId: 1,
      },
      [WORKPLACE]: {
        stackId: 1,
      },
      [SCHOOL]: {
        stackId: 1,
      },
      [COMMUNITY]: {
        stackId: 1,
      },
    },
    presentationOptions: { hideAverage: true },
  },
  dataServices: [{ isDataRegional: false }],
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
