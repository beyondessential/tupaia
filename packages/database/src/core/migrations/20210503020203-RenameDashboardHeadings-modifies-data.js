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

const renameDashboardGroups = async function (db, orgLevel, from, to) {
  await db.runSql(`
  UPDATE "dashboardGroup"
  SET "name" = '${to}'
  WHERE 'laos_schools' = ANY("projectCodes")
  AND "organisationLevel" = '${orgLevel}'
  AND "name" = '${from}'
  `);
};

const createEmptyDashboardGroup = async function (db, orgLevel, name) {
  await db.runSql(`
    INSERT INTO "dashboardGroup"("organisationLevel","userGroup","organisationUnitCode","dashboardReports","name","code","projectCodes")
    VALUES
    ('${orgLevel}','LESMIS Public','LA','{}','${name}','LA_${name
    .split(' ')
    .join('_')}_${orgLevel}_LESMIS_Public',
    '{laos_schools}')
  `);
};

const deleteDashboardGroup = async function (db, orgLevel, name) {
  await db.runSql(`
    DELETE FROM "dashboardGroup"
    WHERE 'laos_schools' = ANY("projectCodes")
    AND "organisationLevel" = '${orgLevel}'
    AND "name" = '${name}'
  `);
};

const addReportToGroup = async function (db, orgLevel, group, report) {
  await db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_append("dashboardReports", '${report}')
    WHERE 'laos_schools' = ANY("projectCodes")
    AND "organisationLevel" = '${orgLevel}'
    AND "name" = '${group}'
  `);
};

const removeReportFromGroup = async function (db, orgLevel, group, report) {
  await db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", '${report}')
    WHERE 'laos_schools' = ANY("projectCodes")
    AND "organisationLevel" = '${orgLevel}'
    AND "name" = '${group}'
  `);
};

const updateOrgLevel = async function (db, orgLevel) {
  await renameDashboardGroups(db, orgLevel, 'Students / Schools', 'Student Outcomes');
  await renameDashboardGroups(db, orgLevel, 'ICT and Utility Data', 'ICT Facilities');
  await renameDashboardGroups(
    db,
    orgLevel,
    'Development Partner Information',
    'Development Partners and Finance',
  );

  await createEmptyDashboardGroup(db, orgLevel, 'Schools');
  await createEmptyDashboardGroup(db, orgLevel, 'Textbooks & Teacher Guides');
  await createEmptyDashboardGroup(db, orgLevel, 'Staff');
  await createEmptyDashboardGroup(db, orgLevel, 'FQS');
  await createEmptyDashboardGroup(db, orgLevel, 'Student Enrolment');

  await addReportToGroup(db, orgLevel, 'Student Enrolment', 'Laos_Schools_Male_Female');
  await addReportToGroup(db, orgLevel, 'COVID', 'LA_Laos_Schools_Resources_Percentage_Preschool');
  await addReportToGroup(db, orgLevel, 'COVID', 'LA_Laos_Schools_Resources_Percentage_Primary');
  await addReportToGroup(db, orgLevel, 'COVID', 'LA_Laos_Schools_Resources_Percentage_Secondary');

  await removeReportFromGroup(db, orgLevel, 'Student Outcomes', 'Laos_Schools_Male_Female');
  await removeReportFromGroup(
    db,
    orgLevel,
    'ICT Facilities',
    'LA_Laos_Schools_Resources_Percentage_Preschool',
  );
  await removeReportFromGroup(
    db,
    orgLevel,
    'ICT Facilities',
    'LA_Laos_Schools_Resources_Percentage_Primary',
  );
  await removeReportFromGroup(
    db,
    orgLevel,
    'ICT Facilities',
    'LA_Laos_Schools_Resources_Percentage_Secondary',
  );
};

const downdateOrgLevel = async function (db, orgLevel) {
  await addReportToGroup(db, orgLevel, 'Student Outcomes', 'Laos_Schools_Male_Female');
  await addReportToGroup(
    db,
    orgLevel,
    'ICT Facilities',
    'LA_Laos_Schools_Resources_Percentage_Preschool',
  );
  await addReportToGroup(
    db,
    orgLevel,
    'ICT Facilities',
    'LA_Laos_Schools_Resources_Percentage_Primary',
  );
  await addReportToGroup(
    db,
    orgLevel,
    'ICT Facilities',
    'LA_Laos_Schools_Resources_Percentage_Secondary',
  );

  await removeReportFromGroup(db, orgLevel, 'Student Enrolment', 'Laos_Schools_Male_Female');
  await removeReportFromGroup(
    db,
    orgLevel,
    'COVID',
    'LA_Laos_Schools_Resources_Percentage_Preschool',
  );
  await removeReportFromGroup(
    db,
    orgLevel,
    'COVID',
    'LA_Laos_Schools_Resources_Percentage_Primary',
  );
  await removeReportFromGroup(
    db,
    orgLevel,
    'COVID',
    'LA_Laos_Schools_Resources_Percentage_Secondary',
  );

  await deleteDashboardGroup(db, orgLevel, 'Schools');
  await deleteDashboardGroup(db, orgLevel, 'Textbooks & Teacher Guides');
  await deleteDashboardGroup(db, orgLevel, 'Staff');
  await deleteDashboardGroup(db, orgLevel, 'FQS');
  await deleteDashboardGroup(db, orgLevel, 'Student Enrolment');

  await renameDashboardGroups(db, orgLevel, 'Student Outcomes', 'Students / Schools');
  await renameDashboardGroups(db, orgLevel, 'ICT Facilities', 'ICT and Utility Data');
  await renameDashboardGroups(
    db,
    orgLevel,
    'Development Partners and Finance',
    'Development Partner Information',
  );
};

exports.up = async function (db) {
  // School
  await renameDashboardGroups(db, 'School', 'Students / Schools', 'Students');
  await renameDashboardGroups(
    db,
    'School',
    'Textbooks and Teacher Guides',
    'Teaching-Learning Materials',
  );
  await renameDashboardGroups(db, 'School', 'ICT and Utility Data', 'ICT Facilities');
  await createEmptyDashboardGroup(db, 'School', 'Teachers');
  await createEmptyDashboardGroup(db, 'School', 'FQS');
  await createEmptyDashboardGroup(db, 'School', 'School Development and Finance');

  // District
  await updateOrgLevel(db, 'SubDistrict');
  // Province
  await updateOrgLevel(db, 'District');
  // Country
  await updateOrgLevel(db, 'Country');

  // Extra stuff where org levels are different
  // Province
  await db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = '{SchDP_Partner_Assistance_Types,Laos_Schools_Number_Of_Pre_Schools_Supported_Development_Partners,Laos_Schools_Number_Of_Primary_Schools_Supported_Development_Partners,Laos_Schools_Number_Of_Secondary_Schools_Supported_Development_Partners}'
    WHERE 'laos_schools' = ANY("projectCodes")
    AND "organisationLevel" = 'District'
    AND "name" = 'Development Partners and Finance'
  `);
};

exports.down = async function (db) {
  // Extra stuff where org levels are different
  // Province
  await db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = '{SchDP_Partner_Assistance_Types}'
    WHERE 'laos_schools' = ANY("projectCodes")
    AND "organisationLevel" = 'District'
    AND "name" = 'Development Partners and Finance'
  `);

  // School
  await deleteDashboardGroup(db, 'School', 'Teachers');
  await deleteDashboardGroup(db, 'School', 'FQS');
  await deleteDashboardGroup(db, 'School', 'School Development and Finance');

  await renameDashboardGroups(db, 'School', 'Students', 'Students / Schools');
  await renameDashboardGroups(
    db,
    'School',
    'Teaching-Learning Materials',
    'Textbooks and Teacher Guides',
  );
  await renameDashboardGroups(db, 'School', 'ICT Facilities', 'ICT and Utility Data');

  // District
  await downdateOrgLevel(db, 'SubDistrict');
  // Province
  await downdateOrgLevel(db, 'District');
  // Country
  await downdateOrgLevel(db, 'Country');
};

exports._meta = {
  version: 1,
};
