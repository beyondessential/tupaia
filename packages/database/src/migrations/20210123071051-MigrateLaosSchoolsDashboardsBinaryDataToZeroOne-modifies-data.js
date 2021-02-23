'use strict';

import { arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

// All dashboards that use Binary internal data which need to be updated
const DASHBOARD_IDS = [
  'LA_Laos_Schools_Service_Availability_Percentage_Preschool',
  'LA_Laos_Schools_Service_Availability_Percentage_Secondary',
  'Laos_Schools_ICT_Facilities_Bar_Graph',
  'Laos_Schools_COVID_19_Bar_Graph',
  'LA_Laos_Schools_Resources_Percentage_Preschool',
  'Laos_Schools_WASH_Bar_Graph',
  'Laos_Schools_Teaching_Learning_Bar_Graph',
  'LA_Laos_Schools_Resources_Percentage_Secondary',
  'LA_Laos_Schools_Resources_Percentage_Primary',
  'LA_Laos_Schools_Service_Availability_Percentage_Primary',
  'Laos_Schools_Number_Of_Pre_Schools_Supported_Development_Partners',
  'Laos_Schools_Number_Of_Primary_Schools_Supported_Development_Partners',
  'Laos_Schools_Number_Of_Secondary_Schools_Supported_Development_Partners',
];

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  // Modify config for Laos Schools dashboards, from <"valueOfInterest": "Yes"> to <valueOfInterest": 1>
  await db.runSql(`
    update "dashboardReport" dr 
    set "dataBuilderConfig" = regexp_replace(dr."dataBuilderConfig"::text, '"valueOfInterest": "Yes"','"valueOfInterest": 1','g')::jsonb 
    where id IN (${arrayToDbString(DASHBOARD_IDS)})
  `);

  // Modify config for Laos Schools dashboards, from <"valueOfInterest": "No"> to <valueOfInterest": 0>
  await db.runSql(`
    update "dashboardReport" dr 
    set "dataBuilderConfig" = regexp_replace(dr."dataBuilderConfig"::text, '"valueOfInterest": "No"','"valueOfInterest": 0','g')::jsonb 
    where id IN (${arrayToDbString(DASHBOARD_IDS)})
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    update "dashboardReport" dr 
    set "dataBuilderConfig" = regexp_replace(dr."dataBuilderConfig"::text, '"valueOfInterest": 1','"valueOfInterest": "Yes"','g')::jsonb 
    where id IN (${arrayToDbString(DASHBOARD_IDS)})
  `);

  await db.runSql(`
   update "dashboardReport" dr 
   set "dataBuilderConfig" = regexp_replace(dr."dataBuilderConfig"::text, '"valueOfInterest": 0','"valueOfInterest": "No"','g')::jsonb 
   where id IN (${arrayToDbString(DASHBOARD_IDS)})
 `);
};

exports._meta = {
  version: 1,
};
