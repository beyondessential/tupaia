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

async function getDashboardReportById(db, id) {
  const { rows: dashboardReports } = await db.runSql(`
      SELECT * FROM "dashboardReport"
      WHERE id = '${id}';
  `);
  return dashboardReports[0] || null;
}

async function updateBuilderConfigByReportId(db, newConfig, reportId) {
  return updateValues(db, 'dashboardReport', { dataBuilderConfig: newConfig }, { id: reportId });
}

const dashboardReportsConfig = {
  ids: [
    'UNFPA_Region_Percentage_Facilities_Offering_Services_ANC',
    'UNFPA_Region_Percentage_Facilities_Offering_Services_Delivery',
    'UNFPA_Region_Percentage_Facilities_Offering_Services_Family_Planning',
    'UNFPA_Region_Percentage_Facilities_Offering_Services_PNC',
  ],
  entityAggregation: {
    newAggregationType: 'COUNT_PER_PERIOD_PER_ORG_GROUP',
    previousAggregationType: 'SUM_PER_PERIOD_PER_ORG_GROUP',
    aggregationConfig: {
      condition: {
        value: 'Yes',
        operator: '=',
      },
    },
  },
};

const id2 = 'UNFPA_Region_Facilities_Offering_Services_At_Least_1_Family_Planning';
const previousAggregationConfig = {
  condition: {
    value: 'Yes',
    operator: '=',
  },
};
const newAggregationConfig = {
  condition: {
    value: 0,
    operator: '>',
  },
};

const updateAggregationConfig = async (db, id, dataBuilderConfig, newCondition) => {
  const newDataBuilderConfig = { ...dataBuilderConfig };
  newDataBuilderConfig.dataBuilders.sumFacilitiesWithServicesAvailable.dataBuilderConfig.entityAggregation.aggregationConfig = newCondition;
  await updateBuilderConfigByReportId(db, newDataBuilderConfig, id);
};

exports.up = async function (db) {
  for (const id of dashboardReportsConfig.ids) {
    const dashboardReport = await getDashboardReportById(db, id);
    const { dataBuilderConfig } = dashboardReport;
    dataBuilderConfig.dataBuilders.sumFacilitiesWithServicesAvailable.dataBuilderConfig.entityAggregation.aggregationType =
      dashboardReportsConfig.entityAggregation.newAggregationType;
    dataBuilderConfig.dataBuilders.sumFacilitiesWithServicesAvailable.dataBuilderConfig.entityAggregation.aggregationConfig =
      dashboardReportsConfig.entityAggregation.aggregationConfig;
    await updateBuilderConfigByReportId(db, dataBuilderConfig, id);
  }

  // id = UNFPA_Region_Facilities_Offering_Services_At_Least_1_Family_Planning
  const dashboardReport = await getDashboardReportById(db, id2);
  const { dataBuilderConfig } = dashboardReport;
  await updateAggregationConfig(db, id2, dataBuilderConfig, newAggregationConfig);
};

exports.down = async function (db) {
  for (const id of dashboardReportsConfig.ids) {
    const dashboardReport = await getDashboardReportById(db, id);
    const { dataBuilderConfig } = dashboardReport;
    dataBuilderConfig.dataBuilders.sumFacilitiesWithServicesAvailable.dataBuilderConfig.entityAggregation.aggregationType =
      dashboardReportsConfig.entityAggregation.newAggrpreviousAggregationTypeegationType;
    delete dataBuilderConfig.dataBuilders.sumFacilitiesWithServicesAvailable.dataBuilderConfig
      .entityAggregation.aggregationConfig;
    await updateBuilderConfigByReportId(db, dataBuilderConfig, id);
  }

  // id = UNFPA_Region_Facilities_Offering_Services_At_Least_1_Family_Planning
  const dashboardReport = await getDashboardReportById(db, id2);
  const { dataBuilderConfig } = dashboardReport;
  await updateAggregationConfig(db, id2, dataBuilderConfig, previousAggregationConfig);
};

exports._meta = {
  version: 1,
};
