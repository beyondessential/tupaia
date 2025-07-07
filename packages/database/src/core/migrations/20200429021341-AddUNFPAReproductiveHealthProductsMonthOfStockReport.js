'use strict';

var dbm;
var type;
var seed;

const arrayToDbString = array => array.map(item => `'${item}'`).join(', ');

const UNFPA_RH_MOS_DATA_CLASSES = {
  UNFPA_RH_MOS_Condoms_male: {
    codes: ['MOS_3b3444bf', 'MOS_a162942e'],
  },
  UNFPA_RH_MOS_Condoms_female: {
    codes: ['MOS_bf4be518'],
  },
  UNFPA_RH_MOS_Ethinylestradiol_levonorgestrel_30mcg_150mcg_tablet: {
    codes: ['MOS_402924bf'],
  },
  UNFPA_RH_MOS_Levonorgestrel_30mcg_tablet: {
    codes: ['MOS_47d584bf'],
  },
  UNFPA_RH_MOS_Etonogestrel_releasing_implant_single_rod_containing_68mg_of_etonogestrel: {
    codes: ['MOS_3ff944bf'],
  },
  UNFPA_RH_MOS_Jadelle_Contraceptive_Implant: {
    codes: ['MOS_d2d28620'],
  },
  UNFPA_RH_MOS_Levonorgestrel_750mcg_tablet_pack_of_two: {
    codes: ['MOS_47fb04bf', 'MOS_47fe44bf'],
  },
  UNFPA_RH_MOS_Medroxyprogesterone_acetate_depot_injection_150mgpermL_in_1mL_vial: {
    codes: ['MOS_53d014bf'],
  },
  UNFPA_RH_MOS_Medroxyprogesterone_acetate_104mgper0dot65ml_SAYANA_Press: {
    codes: ['MOS_4752843e'],
  },
  UNFPA_RH_MOS_Norethisterone_enantate_200mgpermL_in_1mL_ampoule_oily_solution: {
    codes: ['MOS_542a34bf'],
  },
  UNFPA_RH_MOS_Intra_Uterine_Device: {
    codes: ['MOS_4718f43e', 'MOS_3b3994bf'],
  },
};

const UNFPA_RH_MOS_CHART_CONFIG = {
  UNFPA_RH_MOS_Condoms_male: {
    label: 'Condoms, male',
    legendOrder: 0,
    color: '#FC1D26',
  },
  UNFPA_RH_MOS_Condoms_female: {
    label: 'Condoms, female',
    legendOrder: 1,
    color: '#FD9155',
  },
  UNFPA_RH_MOS_Ethinylestradiol_levonorgestrel_30mcg_150mcg_tablet: {
    label: 'COC',
    legendOrder: 2,
    color: '#FEDD64',
  },
  UNFPA_RH_MOS_Levonorgestrel_30mcg_tablet: {
    label: 'POP',
    legendOrder: 3,
    color: '#81D75E',
  },
  UNFPA_RH_MOS_Etonogestrel_releasing_implant_single_rod_containing_68mg_of_etonogestrel: {
    label: 'Implant',
    legendOrder: 4,
    color: '#0F7F3B',
  },
  UNFPA_RH_MOS_Jadelle_Contraceptive_Implant: {
    label: 'Jadelle',
    legendOrder: 5,
    color: '#20C2CA',
  },
  UNFPA_RH_MOS_Levonorgestrel_750mcg_tablet_pack_of_two: {
    label: 'EC',
    legendOrder: 6,
    color: '#40B7FC',
  },
  UNFPA_RH_MOS_Medroxyprogesterone_acetate_depot_injection_150mgpermL_in_1mL_vial: {
    label: 'DMPA',
    legendOrder: 7,
    color: '#0A4EAB',
  },
  UNFPA_RH_MOS_Medroxyprogesterone_acetate_104mgper0dot65ml_SAYANA_Press: {
    label: 'SAYANA Press',
    legendOrder: 8,
    color: '#8C5AFB',
  },
  UNFPA_RH_MOS_Norethisterone_enantate_200mgpermL_in_1mL_ampoule_oily_solution: {
    label: 'Norethisterone',
    legendOrder: 9,
    color: '#FD6AC4',
  },
  UNFPA_RH_MOS_Intra_Uterine_Device: {
    label: 'IUD',
    legendOrder: 10,
    color: '#D9D9D9',
  },
};

const ORG_UNIT_CODES = ['TO_CPMS', 'KI_GEN', 'VU_1180_20', 'SB_500092', 'DL_2'];

const FILTER = {
  organisationUnit: {
    in: ORG_UNIT_CODES,
  },
};

const DASHBOARD_GROUP_CODES_TO_ADD = [
  'DL_Unfpa_Country',
  'TO_Unfpa_Country',
  'VU_Unfpa_Country',
  'SB_Unfpa_Country',
  'KI_Unfpa_Country',
];

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
  await db.runSql(`
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
    VALUES (
      'UNFPA_Reproductive_Health_Product_MOS',
      'sumPerMonth',
      '{
        "dataClasses": ${JSON.stringify(UNFPA_RH_MOS_DATA_CLASSES)},
        "filter": ${JSON.stringify(FILTER)},
        "periodType" : "month"
      }',
      '{
        "name": "Reproductive Health Products Months of Stock (MOS)",
        "type": "chart",
        "chartType": "line",
        "chartConfig": ${JSON.stringify(UNFPA_RH_MOS_CHART_CONFIG)},
        "periodGranularity": "month"
      }'
    );

    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{UNFPA_Reproductive_Health_Product_MOS}'
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUP_CODES_TO_ADD)})
    AND "organisationLevel" = 'Country';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = 'UNFPA_Reproductive_Health_Product_MOS';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", 'UNFPA_Reproductive_Health_Product_MOS')
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUP_CODES_TO_ADD)})
    AND "organisationLevel" = 'Country';
  `);
};

exports._meta = {
  version: 1,
};
