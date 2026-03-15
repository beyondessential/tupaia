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

const UNFPAPriorityMedicinesDashboardReport = {
  projects: [
    { id: 'UNFPA_Priority_Medicines_MOS', code: 'MOS' },
    { id: 'UNFPA_Priority_Medicines_MOS_Project', code: 'MOS' },
    { id: 'UNFPA_Priority_Medicines_AMC', code: 'AMC' },
    { id: 'UNFPA_Priority_Medicines_AMC_Project', code: 'AMC' },
    { id: 'UNFPA_Priority_Medicines_SOH', code: 'SOH' },
    { id: 'UNFPA_Priority_Medicines_SOH_Project', code: 'SOH' },
  ],
  deleteItems: {
    names: [
      'Medroxyprogesterone acetate 104mg\\/0\\.65ml \\(SAYANA Press\\)',
      'Etonogestrel\\-releasing implant \\(single rod containing 68mg of etonogestrel\\)',
      'Norethisterone enantate 200mg\\/mL in 1mL ampoule oily solution',
    ],
    itemsCodes: ['4752843e', '3ff944bf', '542a34bf'],
  },
};

async function deleteItemsFromMatrixConfig(db, dashboardData) {
  for (const project of dashboardData.projects) {
    // Delete these items in rows, e.g. delete "Norethisterone enantate 200mg/mL in 1mL ampoule oily solution",
    for (const name of dashboardData.deleteItems.names) {
      await db.runSql(`
          update "dashboardReport" dr 
          set "dataBuilderConfig" = regexp_replace(dr."dataBuilderConfig"::text, '\\"${name}\\"\\,','')::jsonb 
          where id = '${project.id}'
        `);
    }

    // Delete these item codes in cells list, e.g. delete "MOS_4752843e",
    for (const itemsCode of dashboardData.deleteItems.itemsCodes) {
      await db.runSql(`
          update "dashboardReport" dr 
          set "dataBuilderConfig" = regexp_replace(dr."dataBuilderConfig"::text, '\\"${project.code}\\_${itemsCode}\\"\\,','')::jsonb 
          where id = '${project.id}'
        `);
    }
  }
}

exports.up = async function (db) {
  // Delete these items in dashboardReport config
  await deleteItemsFromMatrixConfig(db, UNFPAPriorityMedicinesDashboardReport);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
