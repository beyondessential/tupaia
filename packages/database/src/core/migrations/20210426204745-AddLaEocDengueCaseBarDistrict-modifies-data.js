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

const dashboardGroup = {
  organisationLevel: 'SubDistrict',
  userGroup: 'Laos EOC User',
  organisationUnitCode: 'LA',
  dashboardReports: '{LA_EOC_Total_Dengue_Cases_by_Week_Sub_District}',
  name: 'Dengue',
  code: 'LAOS_EOC_Dengue_Sub_District',
  projectCodes: '{laos_eoc}',
};

const dashboardReport = {
  id: 'LA_EOC_Total_Dengue_Cases_by_Week_Sub_District',
  dataBuilder: 'countEventsPerPeriodByDataValue',
  dataBuilderConfig: {
    periodType: 'week',
    dataElement: 'NCLE_Disease_Name',
    programCode: 'NCLE_Communicable_Disease',
    valuesOfInterest: [
      {
        label: 'Dengue fever without warning signs cases',
        value: '7.1',
      },
      {
        label: 'Dengue fever with warning signs cases',
        value: '7.2',
      },
      {
        label: 'Severe dengue cases',
        value: '7.3',
      },
    ],
    entityAggregation: {
      dataSourceEntityType: 'facility',
      aggregationEntityType: 'sub_district',
    },
  },
  viewJson: {
    name: 'Total Dengue Cases by Week',
    type: 'chart',
    chartType: 'bar',
    valueType: 'number',
    chartConfig: {
      'Severe dengue cases': {
        color: '#fee906',
        label: 'Severe dengue cases',
        stackId: 1,
        legendOrder: 3,
      },
      'Dengue fever with warning signs cases': {
        color: '#fb0301',
        label: 'Dengue fever with warning signs cases',
        stackId: 1,
        legendOrder: 2,
      },
      'Dengue fever without warning signs cases': {
        color: '#2bb0f0',
        label: 'Dengue fever without warning signs cases',
        stackId: 1,
        legendOrder: 1,
      },
    },
    defaultTimePeriod: {
      end: {
        unit: 'week',
        offset: 0,
      },
      start: {
        unit: 'week',
        offset: -52,
      },
    },
    periodGranularity: 'week',
  },
  dataServices: [{ isDataRegional: false }],
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', dashboardReport);
  await insertObject(db, 'dashboardGroup', dashboardGroup);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardGroup" WHERE code = '${dashboardGroup.code}';
    DELETE FROM "dashboardReport" WHERE id = '${dashboardReport.id}';
  `);
};

exports._meta = {
  version: 1,
};
