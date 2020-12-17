'use strict';

import { updateValues } from '../utilities';
import { getDashboardReportById, updateBuilderConfigByReportId } from '../utilities/migration';

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

const surveyCodes = ['RHC', 'RHFSC', 'RHFSCTS'];

const switchServiceType = async (db, code, serviceType) => {
  await updateValues(db, 'data_source', { service_type: serviceType }, { code });
};

const dashboardReportsChangeForValueOfInterestAndEntityAggregation = [
  'UNFPA_RH_Stock_Cards',
  'UNFPA_Monthly_3_Methods_of_Contraception',
  'UNFPA_Monthly_3_Methods_of_Contraception_Regional',
  'UNFPA_Monthly_5_Methods_of_Contraception',
  'UNFPA_Monthly_5_Methods_of_Contraception_Regional',
  'UNFPA_Facilities_Offering_Delivery',
  'UNFPA_Facilities_Offering_Services',
  'UNFPA_Delivery_Services_Stock',
];
const dashboardReportsChangeForEntityAggregationOnly = [
  'UNFPA_Percentage_Of_Facilities_At_Least_1_Staff_Trained_SRH_Services',
];
const dashboardReportsChangeForValueFromOneToYes = 'UNFPA_Delivery_Services_Stock';

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

  // Modify config mapping dhis to tupaia 1 => Yes, 0 => No, from <"valueOfInterest": 1> to <valueOfInterest": "Yes">
  dashboardReportsChangeForValueOfInterestAndEntityAggregation.forEach(async id => {
    await db.runSql(`
    update "dashboardReport" dr 
    set "dataBuilderConfig" = regexp_replace(dr."dataBuilderConfig"::text, '\\"valueOfInterest\\"\\: 1','"valueOfInterest": "Yes"','g')::jsonb 
    where id = '${id}'
  `);
  });

  // Modify config mapping dhis to tupaia 1 => Yes, 0 => No, from <"value": 1> to <value": "Yes">
  await db.runSql(`
    update "dashboardReport" dr 
    set "dataBuilderConfig" = regexp_replace(dr."dataBuilderConfig"::text, '\\"value\\"\\: 1','"value": "Yes"','g')::jsonb 
    where id = '${dashboardReportsChangeForValueFromOneToYes}'
  `);

  [
    ...dashboardReportsChangeForEntityAggregationOnly,
    ...dashboardReportsChangeForValueOfInterestAndEntityAggregation,
  ].forEach(async id => {
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

  // Modify config mapping dhis to tupaia 1 => Yes, 0 => No, from <"valueOfInterest": "Yes"> to <valueOfInterest": 1>
  dashboardReportsChangeForValueOfInterestAndEntityAggregation.forEach(async id => {
    await db.runSql(`
    update "dashboardReport" dr 
    set "dataBuilderConfig" = regexp_replace(dr."dataBuilderConfig"::text, '\\"valueOfInterest\\"\\: \\"Yes\\"','"valueOfInterest": 1','g')::jsonb 
    where id = '${id}'
  `);
  });

  // Modify config mapping dhis to tupaia 1 => Yes, 0 => No, from <"value": 1> to <value": "Yes">
  await db.runSql(`
  update "dashboardReport" dr 
  set "dataBuilderConfig" = regexp_replace(dr."dataBuilderConfig"::text, '\\"value\\"\\: \\"Yes\\"','"value": 1','g')::jsonb 
  where id = '${dashboardReportsChangeForValueFromOneToYes}'
`);

  [
    ...dashboardReportsChangeForEntityAggregationOnly,
    ...dashboardReportsChangeForValueOfInterestAndEntityAggregation,
  ].forEach(async id => {
    const dashboardReport = await getDashboardReportById(db, id);
    const { dataBuilderConfig } = dashboardReport;
    Object.keys(newElementInDataBuilderConfig).forEach(key => delete dataBuilderConfig[key]);
    await updateBuilderConfigByReportId(db, dataBuilderConfig, id);
  });
};

exports._meta = {
  version: 1,
};
