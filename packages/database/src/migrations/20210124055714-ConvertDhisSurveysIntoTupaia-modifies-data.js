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

const surveyCodes = ['RHC', 'RHFSC', 'RHFSCTS'];

const switchServiceType = async (db, code, serviceType) => {
  await updateValues(db, 'data_source', { service_type: serviceType }, { code });
};

const dashboardReportsChangeForEntityAggregation = [
  'UNFPA_RH_Stock_Cards',
  'UNFPA_Monthly_3_Methods_of_Contraception',
  'UNFPA_Monthly_3_Methods_of_Contraception_Regional',
  'UNFPA_Monthly_5_Methods_of_Contraception',
  'UNFPA_Monthly_5_Methods_of_Contraception_Regional',
  'UNFPA_Facilities_Offering_Delivery',
  'UNFPA_Facilities_Offering_Services',
  'UNFPA_Delivery_Services_Stock',
  'UNFPA_Percentage_Of_Facilities_At_Least_1_Staff_Trained_SRH_Services',
];

const newElementInDataBuilderConfig = {
  entityAggregation: {
    dataSourceEntityType: 'facility',
  },
};

const getDataSources = async (db, codes) => {
  const surveyCodeQuery = codes.map(e => `'${e}'`).join(',');
  return db.runSql(`
  select ds.id, ds.code from data_source ds 
    join data_element_data_group dedg on ds.id = dedg.data_element_id 
    join data_source ds2 on ds2.id = dedg.data_group_id 
  where ds2.code in (${surveyCodeQuery}) 
  group by (ds.id, ds.code)
  `);
};

exports.up = async function (db) {
  const { rows: dataSources } = await getDataSources(db, surveyCodes);
  const serviceType = 'tupaia';

  for (const dataSource of dataSources) {
    await switchServiceType(db, dataSource.code, serviceType);
  }

  for (const code of surveyCodes) {
    await switchServiceType(db, code, serviceType);
  }

  dashboardReportsChangeForEntityAggregation.forEach(async id => {
    const dashboardReport = await getDashboardReportById(db, id);
    const { dataBuilderConfig } = dashboardReport;
    const newDataBuilderConfig = { ...dataBuilderConfig, ...newElementInDataBuilderConfig };
    await updateBuilderConfigByReportId(db, newDataBuilderConfig, id);
  });
};

exports.down = async function (db) {
  const { rows: dataSources } = await getDataSources(db, surveyCodes);
  const serviceType = 'dhis';

  for (const dataSource of dataSources) {
    await switchServiceType(db, dataSource.code, serviceType);
  }

  for (const code of surveyCodes) {
    await switchServiceType(db, code, serviceType);
  }

  dashboardReportsChangeForEntityAggregation.forEach(async id => {
    const dashboardReport = await getDashboardReportById(db, id);
    const { dataBuilderConfig } = dashboardReport;
    Object.keys(newElementInDataBuilderConfig).forEach(key => delete dataBuilderConfig[key]);
    await updateBuilderConfigByReportId(db, dataBuilderConfig, id);
  });
};

exports._meta = {
  version: 1,
};
