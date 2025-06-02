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

exports.up = async function (db) {
  const projects = {
    unfpa: 'UNFPA',
    covidau: 'COVID-19 Australia',
    strive: 'STRIVE PNG',
    wish: 'WISH Fiji',
    imms: 'Immunization Module',
    fanafana: 'Fanafana Ola',
  };
  await db.runSql(`
    INSERT INTO "dashboardGroup"("organisationLevel","userGroup","organisationUnitCode","dashboardReports","name","code")
    VALUES
    (E'Project',E'Public',E'explore',E'{28,29,8,23}',E'General',E'Explore_Project');
  `);

  await db.runSql(`
    INSERT INTO "dashboardGroup"("organisationLevel","userGroup","organisationUnitCode","dashboardReports","name","code")
    VALUES
    (E'Project',E'Public',E'disaster',E'{active_disasters}',E'Disaster Response',E'Disaster_Project');
  `);

  for (const [code, name] of Object.entries(projects)) {
    await db.runSql(`
      INSERT INTO "dashboardGroup"("organisationLevel","userGroup","organisationUnitCode","dashboardReports","name","code")
      VALUES
      (E'Project',E'Public',E'${code}',E'{project_details}',E'${name}',E'${code.toUpperCase()}_Project');
    `);
  }

  return db.runSql(`
    INSERT INTO "dashboardReport"("id","viewJson")
    VALUES
    (E'project_details',E'{"name": "Basic Project Information", "type": "component", "componentName": "ProjectDescription"}');
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM "dashboardGroup" where "organisationLevel" = 'Project';

    DELETE FROM "dashboardReport" where id = 'project_details';
  `);
};

exports._meta = {
  version: 1,
};
