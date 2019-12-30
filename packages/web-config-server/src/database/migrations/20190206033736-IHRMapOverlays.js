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
      "name", "groupName", "userGroup", "dataElementCode", "displayType", "customColors", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "linkedMeasures", "sortOrder", "measureBuilderConfig", "measureBuilder")
    VALUES('Subnational legislation and financing', 'International Health Regulations', 'Admin', 'IHRI002', 'shading', 'Red,Orange,Yellow,Lime,Green', true, false, false, false, null, 168, '{"organisationUnitLevel": "District"}', 'mostRecentValueFromChildren');
  
    INSERT INTO "mapOverlay"(
      "name", "groupName", "userGroup", "dataElementCode", "displayType", "customColors", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "linkedMeasures", "sortOrder", "measureBuilderConfig", "measureBuilder")
    VALUES('IHR strategic coordination', 'International Health Regulations', 'Admin', 'IHRI006', 'shading', 'Red,Orange,Yellow,Lime,Green', true, false, false, false, null, 168, '{"organisationUnitLevel": "District"}', 'mostRecentValueFromChildren');

    INSERT INTO "mapOverlay"(
      "name", "groupName", "userGroup", "dataElementCode", "displayType", "customColors", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "linkedMeasures", "sortOrder", "measureBuilderConfig", "measureBuilder")
    VALUES('Zoonotic events and the human-animal interface', 'International Health Regulations', 'Admin', 'IHRI009', 'shading', 'Red,Orange,Yellow,Lime,Green', true, false, false, false, null, 168, '{"organisationUnitLevel": "District"}', 'mostRecentValueFromChildren');
      
    INSERT INTO "mapOverlay"(
      "name", "groupName", "userGroup", "dataElementCode", "displayType", "customColors", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "linkedMeasures", "sortOrder", "measureBuilderConfig", "measureBuilder")
    VALUES('Food safety', 'International Health Regulations', 'Admin', 'IHRI012', 'shading', 'Red,Orange,Yellow,Lime,Green', true, false, false, false, null, 168, '{"organisationUnitLevel": "District"}', 'mostRecentValueFromChildren');

    INSERT INTO "mapOverlay"(
      "name", "groupName", "userGroup", "dataElementCode", "displayType", "customColors", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "linkedMeasures", "sortOrder", "measureBuilderConfig", "measureBuilder")
    VALUES('Laboratory', 'International Health Regulations', 'Admin', 'IHRI016', 'shading', 'Red,Orange,Yellow,Lime,Green', true, false, false, false, null, 168, '{"organisationUnitLevel": "District"}', 'mostRecentValueFromChildren');

    INSERT INTO "mapOverlay"(
      "name", "groupName", "userGroup", "dataElementCode", "displayType", "customColors", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "linkedMeasures", "sortOrder", "measureBuilderConfig", "measureBuilder")
    VALUES('Surveillance', 'International Health Regulations', 'Admin', 'IHRI021', 'shading', 'Red,Orange,Yellow,Lime,Green', true, false, false, false, null, 168, '{"organisationUnitLevel": "District"}', 'mostRecentValueFromChildren');
  
    INSERT INTO "mapOverlay"(
      "name", "groupName", "userGroup", "dataElementCode", "displayType", "customColors", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "linkedMeasures", "sortOrder", "measureBuilderConfig", "measureBuilder")
    VALUES('Human resources', 'International Health Regulations', 'Admin', 'IHRI026', 'shading', 'Red,Orange,Yellow,Lime,Green', true, false, false, false, null, 168, '{"organisationUnitLevel": "District"}', 'mostRecentValueFromChildren');

    INSERT INTO "mapOverlay"(
      "name", "groupName", "userGroup", "dataElementCode", "displayType", "customColors", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "linkedMeasures", "sortOrder", "measureBuilderConfig", "measureBuilder")
    VALUES('Emergency preparedness for response', 'International Health Regulations', 'Admin', 'IHRI030', 'shading', 'Red,Orange,Yellow,Lime,Green', true, false, false, false, null, 168, '{"organisationUnitLevel": "District"}', 'mostRecentValueFromChildren');
  
    INSERT INTO "mapOverlay"(
      "name", "groupName", "userGroup", "dataElementCode", "displayType", "customColors", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "linkedMeasures", "sortOrder", "measureBuilderConfig", "measureBuilder")
    VALUES('Resilient health services', 'International Health Regulations', 'Admin', 'IHRI035', 'shading', 'Red,Orange,Yellow,Lime,Green', true, false, false, false, null, 168, '{"organisationUnitLevel": "District"}', 'mostRecentValueFromChildren');

    INSERT INTO "mapOverlay"(
      "name", "groupName", "userGroup", "dataElementCode", "displayType", "customColors", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "linkedMeasures", "sortOrder", "measureBuilderConfig", "measureBuilder")
    VALUES('Risk communication', 'International Health Regulations', 'Admin', 'IHRI043', 'shading', 'Red,Orange,Yellow,Lime,Green', true, false, false, false, null, 168, '{"organisationUnitLevel": "District"}', 'mostRecentValueFromChildren');

    INSERT INTO "mapOverlay"(
      "name", "groupName", "userGroup", "dataElementCode", "displayType", "customColors", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "linkedMeasures", "sortOrder", "measureBuilderConfig", "measureBuilder")
    VALUES('Points of Entry (PoE)', 'International Health Regulations', 'Admin', 'IHRI047', 'shading', 'Red,Orange,Yellow,Lime,Green', true, false, false, false, null, 168, '{"organisationUnitLevel": "District"}', 'mostRecentValueFromChildren');

    INSERT INTO "mapOverlay"(
      "name", "groupName", "userGroup", "dataElementCode", "displayType", "customColors", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "linkedMeasures", "sortOrder", "measureBuilderConfig", "measureBuilder")
    VALUES('Chemical events', 'International Health Regulations', 'Admin', 'IHRI051', 'shading', 'Red,Orange,Yellow,Lime,Green', true, false, false, false, null, 168, '{"organisationUnitLevel": "District"}', 'mostRecentValueFromChildren');

    INSERT INTO "mapOverlay"(
      "name", "groupName", "userGroup", "dataElementCode", "displayType", "customColors", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "linkedMeasures", "sortOrder", "measureBuilderConfig", "measureBuilder")
    VALUES('Radiation emergencies', 'International Health Regulations', 'Admin', 'IHRI055', 'shading', 'Red,Orange,Yellow,Lime,Green', true, false, false, false, null, 168, '{"organisationUnitLevel": "District"}', 'mostRecentValueFromChildren');

    INSERT INTO "mapOverlay"(
      "name", "groupName", "userGroup", "dataElementCode", "displayType", "customColors", "isDataRegional", "hideFromMenu", "hideFromPopup", "hideFromLegend", "linkedMeasures", "sortOrder", "measureBuilderConfig", "measureBuilder")
    VALUES('Environment and climate change', 'International Health Regulations', 'Admin', 'IHRI059', 'shading', 'Red,Orange,Yellow,Lime,Green', true, false, false, false, null, 168, '{"organisationUnitLevel": "District"}', 'mostRecentValueFromChildren');
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
