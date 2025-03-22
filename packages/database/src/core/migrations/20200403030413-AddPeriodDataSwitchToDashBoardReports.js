'use strict';

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

// Display data period only in dashboard
const reportIdsforDashboardOnly = [
  'COVID_AU_Total_Cases_Each_State_Per_Day',
  'COVID_New_Cases_By_Day',
  'COVID_Daily_Cases_By_Type',
  'COVID_New_Cases_By_State',
];

// Display data period in dashbaord and enlargeDialogue
const reportIdsforEnlargeDialogue = ['COVID_Total_Cases_By_State', 'COVID_Total_Cases_By_Type'];

const arrayToDbString = array => array.map(item => `'${item}'`).join(', ');

exports.up = function (db) {
  return db.runSql(`
      UPDATE "dashboardReport" 
        SET "viewJson" = jsonb_set("viewJson", '{showPeriodRange}', '"dashboardOnly"')
        where "id" IN (${arrayToDbString(reportIdsforDashboardOnly)});
    
      UPDATE "dashboardReport" 
        SET "viewJson" = jsonb_set("viewJson", '{showPeriodRange}', '"all"')
        where "id" IN (${arrayToDbString(reportIdsforEnlargeDialogue)});
    `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "dashboardReport" 
      SET "viewJson" = "viewJson" - 'showPeriodRange'
      where "id" IN (${arrayToDbString(reportIdsforDashboardOnly)});

    UPDATE "dashboardReport" 
      SET "viewJson" = "viewJson" - 'showPeriodRange'
      where "id" IN (${arrayToDbString(reportIdsforEnlargeDialogue)});
`);
};

exports._meta = {
  version: 1,
};
