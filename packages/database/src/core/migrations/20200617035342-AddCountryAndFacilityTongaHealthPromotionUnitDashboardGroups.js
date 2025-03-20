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

const TONGA_HPU_NAME = 'Health Promotion Unit';

const TONGA_HPU_USER_GROUP = 'Tonga Health Promotion Unit';

const DASHBOARD_REPORTS = {};

const PROJECT_CODES = '{fanafana,explore}';

const ORGANISATION_UNIT_CODE = 'TO';

const TO_HPU_DASHBOARD_GROUPS = [
  {
    code: 'TO_Health_Promotion_Unit_Country',
    organisationLevel: 'Country',
  },
  {
    code: 'TO_Health_Promotion_Unit_Facility',
    organisationLevel: 'Facility',
  },
];

const BASIC_TO_DASHBOARD_GROUP_OBJECT = {
  dashboardReports: DASHBOARD_REPORTS,
  organisationUnitCode: ORGANISATION_UNIT_CODE,
  userGroup: TONGA_HPU_USER_GROUP,
  name: TONGA_HPU_NAME,
  projectCodes: PROJECT_CODES,
};

exports.up = async function (db) {
  await Promise.all(
    TO_HPU_DASHBOARD_GROUPS.map(dashboardGroup => {
      const { code, organisationLevel } = dashboardGroup;
      return insertObject(db, 'dashboardGroup', {
        ...BASIC_TO_DASHBOARD_GROUP_OBJECT,
        code,
        organisationLevel,
      });
    }),
  );
};

exports.down = async function (db) {
  await db.runSql(`	
    DELETE FROM "dashboardGroup" 
    WHERE "code" in (${arrayToDbString(
      TO_HPU_DASHBOARD_GROUPS.map(dashboardGroup => dashboardGroup.code),
    )});	
  `);
};

exports._meta = {
  version: 1,
};
