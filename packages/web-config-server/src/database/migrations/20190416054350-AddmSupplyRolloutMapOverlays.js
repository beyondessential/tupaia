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
      "name", "groupName", "userGroup", "dataElementCode", "displayType", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "sortOrder", "measureBuilderConfig", "measureBuilder", "countryCodes"
    )
    VALUES(
      'État de mise en œuvre', 'Déploiement du mSupply', 'Admin', 'MSUP1037', 'color', true, false, false, false, 0, '{"organisationUnitLevel": "Facility"}', 'valueForOrgGroup', '{CI}'
    );
    
    INSERT INTO "mapOverlay"(
      "name", "groupName", "userGroup", "dataElementCode", "displayType", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "sortOrder", "measureBuilderConfig", "measureBuilder", "countryCodes"
    )
    VALUES(
      E'L\\'ordinateur fonctionne', 'Déploiement du mSupply', 'Admin', 'MSUP1004', 'color', true, false, false, false, 0, '{"organisationUnitLevel": "Facility"}', 'valueForOrgGroup', '{CI}'
    );
    
    INSERT INTO "mapOverlay"(
      "name", "groupName", "userGroup", "dataElementCode", "displayType", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "sortOrder", "measureBuilderConfig", "measureBuilder", "countryCodes"
    )
    VALUES(
      'Connecté à internet', 'Déploiement du mSupply', 'Admin', 'MSUP1012', 'color', true, false, false, false, 0, '{"organisationUnitLevel": "Facility"}', 'valueForOrgGroup', '{CI}'
    );
    
    INSERT INTO "mapOverlay"(
      "name", "groupName", "userGroup", "dataElementCode", "displayType", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "sortOrder", "measureBuilderConfig", "measureBuilder", "countryCodes"
    )
    VALUES(
      'Formation du personnel terminée', 'Déploiement du mSupply', 'Admin', 'MSUP1015', 'color', true, false, false, false, 0, '{"organisationUnitLevel": "Facility"}', 'valueForOrgGroup', '{CI}'
    );
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
