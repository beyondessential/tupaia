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

const dashboardReportId = 'Raw_Data_KI_MS1_Surveys';
const dashboardGroupName = 'MS1 Administration';
const mapOverlayId = 'MS1_COMPLETENESS';
exports.up = async function (db) {
  // Add MS1 Administration to Dashboard Group
  await db.runSql(`
      INSERT INTO "dashboardGroup" (
        "organisationLevel" ,
        "userGroup" ,
        "organisationUnitCode" ,
        "dashboardReports" ,
        "name",
        "code",
        "projectCodes")
        
      VALUES (
        'Country',
        'MS1 Administration',
        'KI',
        '{${dashboardReportId}}',
        '${dashboardGroupName}',
        'KI_MS1_Administration',
        '{explore}'
      );
  `);

  // Find every survey in the Kiribati HIS Survey Group
  const { rows: surveys } = await db.runSql(`
      SELECT s.name, s.code FROM survey s 
      JOIN survey_group sg ON s.survey_group_id = sg.id
      WHERE sg.name = 'Kiribati HIS';
  `);

  // Add MS1 Administration data to Dashboard Report
  await db.runSql(`
    INSERT INTO "dashboardReport" (
      "id",
      "dataBuilder",
      "dataBuilderConfig",
      "viewJson"
    )
    
    VALUES (
      '${dashboardReportId}',
      'rawDataDownload',
      '{
        "surveys": ${JSON.stringify(surveys)}
       }',
      '{
        "name": "MS1 Administration",
        "type": "view",
        "viewType": "dataDownload",
        "periodGranularity": "month"
      }'
    );
  `);

  // Change map overlay (id: MS1_COMPLETENESS) permission to the new permissions group
  await db.runSql(`
    UPDATE "mapOverlay" 
    SET "userGroup" = 'MS1 Administration'
    WHERE id = '${mapOverlayId}';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardGroup" 
    WHERE name = '${dashboardGroupName}';
  `);

  await db.runSql(`
    DELETE FROM "dashboardReport" 
    WHERE id = '${dashboardReportId}';
  `);

  await db.runSql(`
    UPDATE "mapOverlay" 
    SET "userGroup" = 'Admin'
    WHERE id = '${mapOverlayId}';
  `);
};

exports._meta = {
  version: 1,
};
