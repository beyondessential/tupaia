'use strict';

import { generateId } from '../utilities';
import { arrayToDbString } from '../utilities/migration';

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

const PROJECT_CODE = 'unfpa';
const DASHBOARD_CODE = 'UNFPA';
const getUnfpaHierarchyId = async db =>
  db.runSql(`select id from entity_hierarchy where name = '${PROJECT_CODE}' limit 1;`);
const getEntityIdFromCode = async (db, code) =>
  db.runSql(`select id from entity where code = '${code}' limit 1;`);
const countriesToAddToProject = ['KI', 'VU', 'FJ', 'SB'];

const facilityDashboardIds = [
  'UNFPA_RH_Contraceptives_Offered',
  'UNFPA_RH_Services_Offered',
  'UNFPA_Staff_Trained_Matrix',
];
const generalDashboardIds = [
  'UNFPA_RH_Stock_Cards',
  'UNFPA_Monthly_3_Methods_of_Contraception',
  'UNFPA_Facilities_Offering_Delivery',
  'UNFPA_Facilities_Offering_Services',
  'UNFPA_Monthly_5_Methods_of_Contraception',
];
const msupplyDashboardIds = [
  'UNFPA_Priority_Medicines_SOH',
  'UNFPA_Priority_Medicines_AMC',
  'UNFPA_Priority_Medicines_MOS',
  'UNFPA_Delivery_Services_Stock',
];

const generalCountryCodes = ['MH', 'WS', 'FM', 'FJ'];
const msupplyCountryCodes = ['TO', 'VU', 'SB', 'KI'];
const countriesWithSubdistricts = ['KI', 'VU'];

exports.up = async function (db) {
  /** Updating project entity relations */
  const unfpaHierarchyId = (await getUnfpaHierarchyId(db)).rows[0].id;
  const unfpaProjectId = (await getEntityIdFromCode(db, PROJECT_CODE)).rows[0].id;
  for (const code of countriesToAddToProject) {
    const countryId = (await getEntityIdFromCode(db, code)).rows[0].id;
    await db.runSql(`
      insert into entity_relation (id, parent_id, child_id, entity_hierarchy_id)
      values (
        '${generateId()}',
        '${unfpaProjectId}',
        '${countryId}',
        '${unfpaHierarchyId}'
      );
    `);
  }

  /** Updating dashboard groups and reports */

  // first insert the new dashboardGroups
  for (const code of countriesToAddToProject) {
    for (const level of ['Country', 'District', 'SubDistrict', 'Facility']) {
      if (!countriesWithSubdistricts.includes(code) && level === 'SubDistrict') continue;
      await db.runSql(`
        insert into "dashboardGroup" ("organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name", "code")
        values (
          '${level}',
          '${DASHBOARD_CODE}',
          '${code}',
          '{}',
          '${DASHBOARD_CODE}',
          '${code}_Unfpa_${level}'
        );
      `);
    }
  }

  // now update all the dashboardGroups reports
  // facility level groups
  await db.runSql(`
    update "dashboardGroup"
    set "dashboardReports" = '{${facilityDashboardIds.join(',')}}'
    where "name" = '${DASHBOARD_CODE}' and "organisationLevel" = 'Facility';
  `);

  // General Country / District level groups
  await db.runSql(`
    update "dashboardGroup"
    set "dashboardReports" = '{${generalDashboardIds.join(',')}}'
    where "name" = '${DASHBOARD_CODE}' and "organisationLevel" in ('Country', 'District') and "organisationUnitCode" in (${arrayToDbString(
    generalCountryCodes,
  )});
  `);

  // Msupply Country / District and SubDistrict (VU/KI) level groups
  return db.runSql(`
    update "dashboardGroup"
    set "dashboardReports" = '{${[...generalDashboardIds, ...msupplyDashboardIds].join(',')}}'
    where "name" = '${DASHBOARD_CODE}' and "organisationLevel" in ('Country', 'SubDistrict', 'District') and "organisationUnitCode" in (${arrayToDbString(
    msupplyCountryCodes,
  )});
  `);
};

exports.down = async function (db) {
  const unfpaHierarchyId = (await getUnfpaHierarchyId(db)).rows[0].id;
  for (const code of countriesToAddToProject) {
    const countryId = (await getEntityIdFromCode(db, code)).rows[0].id;
    await db.runSql(`
      delete from entity_relation where "child_id" = '${countryId}' and "entity_hierarchy_id" = '${unfpaHierarchyId}';
    `);
  }

  await db.runSql(`
        delete from "dashboardGroup" where "name" = '${DASHBOARD_CODE}' and "organisationUnitCode" in (${arrayToDbString(
    countriesToAddToProject,
  )});
      `);

  await db.runSql(`
      update "dashboardGroup"
      set "dashboardReports" = '{UNFPA_RH_Contraceptives_Offered,UNFPA_RH_Services_Offered,UNFPA_Staff_Trained_Matrix}'
      where "name" = '${DASHBOARD_CODE}' and "organisationLevel" = 'Facility';
    `);

  return db.runSql(`
    update "dashboardGroup"
    set "dashboardReports" = '{UNFPA_Priority_Medicines_AMC,UNFPA_Priority_Medicines_SOH,UNFPA_Priority_Medicines_MOS,UNFPA_Monthly_3_Methods_of_Contraception,UNFPA_Monthly_5_Methods_of_Contraception,UNFPA_Facilities_Offering_Services,UNFPA_Facilities_Offering_Delivery,UNFPA_RH_Stock_Cards,UNFPA_Delivery_Services_Stock}'
    where "name" = '${DASHBOARD_CODE}' and "organisationLevel" in ('Country', 'District');
  `);
};

exports._meta = {
  version: 1,
};
