'use strict';

import { insertObject, arrayToDbString } from '../utilities';

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
const dashboardGroups = [
  // Covid Fiji
  {
    organisationLevel: 'Country',
    organisationUnitCode: 'FJ',
    name: 'COVID-19 Fiji',
    code: 'FJ_Covid_Fiji_Country_COVID-19',
    projectCodes: `{supplychain_fiji}`,
  },
  {
    organisationLevel: 'District',
    organisationUnitCode: 'FJ',
    name: 'COVID-19 Fiji',
    code: 'FJ_Covid_Fiji_District_COVID-19',
    projectCodes: `{supplychain_fiji}`,
  },
  {
    organisationLevel: 'Village',
    organisationUnitCode: 'FJ',
    name: 'COVID-19 Fiji',
    code: 'FJ_Covid_Fiji_Village_COVID-19',
    projectCodes: `{supplychain_fiji}`,
  },

  // Samoa:
  {
    organisationLevel: 'Country',
    organisationUnitCode: 'WS',
    name: 'COVID-19 Samoa',
    code: 'WS_Covid_Samoa_Country_COVID-19',
    projectCodes: `{covid_samoa}`,
  },
  {
    organisationLevel: 'District',
    organisationUnitCode: 'WS',
    name: 'COVID-19 Samoa',
    code: 'WS_Covid_Samoa_District_COVID-19',
    projectCodes: `{covid_samoa}`,
  },
  {
    organisationLevel: 'Village',
    organisationUnitCode: 'WS',
    name: 'COVID-19 Samoa',
    code: 'WS_Covid_Samoa_Village_COVID-19',
    projectCodes: `{covid_samoa}`,
  },

  // Nauru:
  {
    organisationLevel: 'Country',
    organisationUnitCode: 'NR',
    name: 'COVID-19 Nauru',
    code: 'NR_Covid_Nauru_Country_COVID-19',
    projectCodes: `{ehealth_nauru}`,
  },
  {
    organisationLevel: 'District',
    organisationUnitCode: 'NR',
    name: 'COVID-19 Nauru',
    code: 'NR_Covid_Nauru_District_COVID-19',
    projectCodes: `{ehealth_nauru}`,
  },
  {
    organisationLevel: 'Village',
    organisationUnitCode: 'NR',
    name: 'COVID-19 Nauru',
    code: 'NR_Covid_Nauru_Village_COVID-19',
    projectCodes: `{ehealth_nauru}`,
  },
];

exports.up = async function (db) {
  await Promise.all(
    dashboardGroups.map(dashboardGroup =>
      insertObject(db, 'dashboardGroup', {
        organisationLevel: dashboardGroup.organisationLevel,
        userGroup: 'COVID-19',
        organisationUnitCode: dashboardGroup.organisationUnitCode,
        dashboardReports: '{}',
        name: dashboardGroup.name,
        code: dashboardGroup.code,
        projectCodes: dashboardGroup.projectCodes,
      }),
    ),
  );
};

exports.down = function (db) {
  return db.runSql(`
    delete from "dashboardGroup" where code in (${arrayToDbString(
      dashboardGroups.map(dbg => dbg.code),
    )});
  `);
};

exports._meta = {
  version: 1,
};
