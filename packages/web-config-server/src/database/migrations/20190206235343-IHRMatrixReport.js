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
  // Rename the validation group to validation, and remove the one descriptive report from it and
  // add it to a new group for descriptive reports
  return db.runSql(`
    
    INSERT INTO "dashboardGroup"(
      "organisationLevel",
      "userGroup",
      "organisationUnitCode",
      "dashboardReports",
      "name",
      "code"
      )
      VALUES(
        'Country',
        'International Health Regulations',
        'SB',
        '{SB_IHR_Matrix}',
        'International Health Regulations',
        'International_Health_Regulations_SB'
      );
    
    INSERT INTO "public"."dashboardReport"(
      "id",
      "drillDownLevel",
      "dataBuilder",
      "dataBuilderConfig",
      "viewJson",
      "isDataRegional"
      )
      VALUES
      (
        E'SB_IHR_Matrix',
        NULL,
        E'matrixMostRecentFromChildren',
        '{"optionSetCode": "green.lime.yellow.orange.red", "dataElementCodes": ["DE_GROUP-IHR_Group_01", "DE_GROUP-IHR_Group_02", "DE_GROUP-IHR_Group_03", "DE_GROUP-IHR_Group_04", "DE_GROUP-IHR_Group_05", "DE_GROUP-IHR_Group_06", "DE_GROUP-IHR_Group_07", "DE_GROUP-IHR_Group_08", "DE_GROUP-IHR_Group_09", "DE_GROUP-IHR_Group_10", "DE_GROUP-IHR_Group_11", "DE_GROUP-IHR_Group_12", "DE_GROUP-IHR_Group_13", "DE_GROUP-IHR_Group_14"], "dataElementGroup": "IHR_Survey", "dataElementGroupSet": "IHR_Groups", "dataElementColumnTitle": "Metrics", "organisationUnitIsGroup": false, "organisationUnitLevel": "District"}',
        '{"//": "For translating from 0-4 value to white-red", "name": "International Health Regulations", "type": "chart", "chartType": "matrix", "placeholder": "/static/media/PEHSMatrixPlaceholder.png", "presentationOptions": {"red": {"color": "#b71c1c", "label": "", "description": "**Red** Level 1\\n"}, "lime": {"color": "#7cb342", "label": "", "description": "**Light Green** Level 4\\n"}, "green": {"color": "#33691e", "label": "", "description": "**Green** Level 5\\n"}, "orange": {"color": "#ef6c00", "label": "", "description": "**Orange** Level 2\\n"}, "yellow": {"color": "#fdd835", "label": "", "description": "**Yellow** Level 3\\n"}}}',
        TRUE);
    
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
