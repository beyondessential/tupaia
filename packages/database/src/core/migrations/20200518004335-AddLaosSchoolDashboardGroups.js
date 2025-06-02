import { insertObject, arrayToDbString } from '../utilities';

('use strict');

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

const LAOS_SCHOOLS_NAME = 'Laos Schools';

const LAOS_SCHOOLS_MOES_VIEW_NAME = 'Laos Schools MoES View';

const LAOS_SCHOOLS_USER_GROUP = 'Laos Schools User';

const LAOS_SCHOOLS_SUPER_USER_GROUP = 'Laos Schools Super User';

const DASHBOARD_REPORTS = {};

const ORGANISATION_UNIT_CODE = 'LA';

const LAOS_SCHOOLS_DASHBOARD_GROUPS = [
  {
    code: 'LA_Laos_Schools_Country_Laos_Schools_User',
    organisationLevel: 'Country',
    userGroup: LAOS_SCHOOLS_USER_GROUP,
    name: LAOS_SCHOOLS_NAME,
  },
  {
    code: 'LA_Laos_Schools_Province_Laos_Schools_User',
    organisationLevel: 'District',
    userGroup: LAOS_SCHOOLS_USER_GROUP,
    name: LAOS_SCHOOLS_NAME,
  },
  {
    code: 'LA_Laos_Schools_District_Laos_Schools_User',
    organisationLevel: 'SubDistrict',
    userGroup: LAOS_SCHOOLS_USER_GROUP,
    name: LAOS_SCHOOLS_NAME,
  },
  {
    code: 'LA_Laos_Schools_School_Laos_Schools_User',
    organisationLevel: 'School',
    userGroup: LAOS_SCHOOLS_USER_GROUP,
    name: LAOS_SCHOOLS_NAME,
  },
  {
    code: 'LA_Laos_Schools_Country_Laos_Schools_Super_User',
    organisationLevel: 'Country',
    userGroup: LAOS_SCHOOLS_SUPER_USER_GROUP,
    name: LAOS_SCHOOLS_MOES_VIEW_NAME,
  },
  {
    code: 'LA_Laos_Schools_Province_Laos_Schools_Super_User',
    organisationLevel: 'District',
    userGroup: LAOS_SCHOOLS_SUPER_USER_GROUP,
    name: LAOS_SCHOOLS_MOES_VIEW_NAME,
  },
  {
    code: 'LA_Laos_Schools_District_Laos_Schools_Super_User',
    organisationLevel: 'SubDistrict',
    userGroup: LAOS_SCHOOLS_SUPER_USER_GROUP,
    name: LAOS_SCHOOLS_MOES_VIEW_NAME,
  },
  {
    code: 'LA_Laos_Schools_School_Laos_Schools_Super_User',
    organisationLevel: 'School',
    userGroup: LAOS_SCHOOLS_SUPER_USER_GROUP,
    name: LAOS_SCHOOLS_MOES_VIEW_NAME,
  },
];

const BASIC_LAOS_SCHOOLS_DASHBOARD_GROUP_OBJECT = {
  dashboardReports: DASHBOARD_REPORTS,
  organisationUnitCode: ORGANISATION_UNIT_CODE,
};

exports.up = async function (db) {
  await Promise.all(
    LAOS_SCHOOLS_DASHBOARD_GROUPS.map(dashboardGroup => {
      const { code, organisationLevel, userGroup, name } = dashboardGroup;
      return insertObject(db, 'dashboardGroup', {
        ...BASIC_LAOS_SCHOOLS_DASHBOARD_GROUP_OBJECT,
        code,
        organisationLevel,
        userGroup,
        name,
      });
    }),
  );
};

exports.down = async function (db) {
  await db.runSql(`	
    DELETE FROM "dashboardGroup" 
    WHERE "code" in (${arrayToDbString(
      LAOS_SCHOOLS_DASHBOARD_GROUPS.map(dashboardGroup => dashboardGroup.code),
    )});	
  `);
};

exports._meta = {
  version: 1,
};
