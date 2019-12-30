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
  INSERT INTO "mapOverlay"(
    "id", "name", "groupName", "userGroup", "dataElementCode", "displayType", "isDataRegional", "values", "hideFromMenu", "hideFromPopup", "hideFromLegend", "measureBuilderConfig", "measureBuilder", "countryCodes"
  ) VALUES (
   999, 'Households', 'Population', 'Donor', 'POP42', 'radius', false, '[{"color": "blue", "value": "other"}, {"color": "grey", "value": null}]', false, false, false, '{"organisationUnitLevel": "Facility"}', 'valueForOrgGroup', '{TO}'
  );
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
