'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "viewJson" = '{"name": "Disaster Affected Facilities", "type": "chart", "chartType": "pie", "presentationOptions": {"Not affected": {"color": "#0AB45A"}, "Not applicable": {"color": "#8214A0"}, "To be completed": {"color": "#00A0FA"}, "Partially affected": {"color": "#F0F032"}, "Completely affected": {"color": "#AA0A3C"}}}'
    WHERE "id" = 'Disaster_Response_Facilities_Affected';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
