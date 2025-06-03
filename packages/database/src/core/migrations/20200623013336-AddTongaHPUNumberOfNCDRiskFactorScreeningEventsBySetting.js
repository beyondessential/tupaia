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
const SCHOOL = 'School';
const WORKPLACE = 'Workplace';
const COMMUNITY = 'Community';

const DATA_ELEMENT = 'HP31n';

const DASHBOARD_GROUP_CODE = 'TO_Health_Promotion_Unit_Country';

const REPORT_ID = 'TO_HPU_Number_NCD_Risk_Factor_Screening_Events_By_Setting';

const BASE_SUB_BUILDER_CONFIG = {
  groupBy: {
    type: 'allOrgUnitNames',
    options: {
      type: 'facility',
      parentCode: '{organisationUnitCode}', // will be replaced when translated dataBuilderConfig
    },
  },
  entityAggregation: {
    dataSourceEntityType: 'village',
    aggregationEntityType: 'facility',
    aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
  },
  periodType: 'year',
  programCode: 'HP02',
};

const DATA_BUILDER_CONFIG = {
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
    [SCHOOL]: {
      dataBuilder: 'countEvents',
      dataBuilderConfig: {
        ...BASE_SUB_BUILDER_CONFIG,
        dataValues: {
          [DATA_ELEMENT]: SCHOOL,
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
};

const VIEW_JSON = {
  name: 'Number of NCD risk factor screening events (by setting)',
  type: 'chart',
  chartType: 'bar',
  periodGranularity: 'one_year_at_a_time',
  chartConfig: {
    [CHURCH]: {
      stackId: 1,
      legendOrder: 1,
    },
    [SCHOOL]: {
      stackId: 1,
      legendOrder: 2,
    },
    [WORKPLACE]: {
      stackId: 1,
      legendOrder: 3,
    },
    [COMMUNITY]: {
      stackId: 1,
      legendOrder: 4,
    },
  },
  presentationOptions: { hideAverage: true },
};

const DATA_SERVICES = [{ isDataRegional: false }];

const REPORT = {
  id: REPORT_ID,
  dataBuilder: 'composeDataPerOrgUnit',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON,
  dataServices: DATA_SERVICES,
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
