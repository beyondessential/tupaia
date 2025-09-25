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

const arrayToDbString = array => array.map(item => `'${item}'`).join(', ');

const UNFPA_RH_AMC_DATA_CLASSES = {
  UNFPA_RH_AMC_Male_condoms: {
    codes: ['AMC_3b3444bf', 'AMC_a162942e'],
  },
  UNFPA_RH_AMC_Female_condoms: {
    codes: ['AMC_bf4be518'],
  },
  UNFPA_RH_AMC_COCs: {
    codes: ['AMC_402924bf'],
  },
  UNFPA_RH_AMC_POP: {
    codes: ['AMC_47d584bf'],
  },
  UNFPA_RH_AMC_Implant_Contraceptives: {
    codes: ['AMC_3ff944bf'],
  },
  UNFPA_RH_AMC_Jadelle: {
    codes: ['AMC_d2d28620'],
  },
  UNFPA_RH_AMC_EC_2_dose: {
    codes: ['AMC_47fb04bf', 'ACM_47fe44bf'],
  },
  UNFPA_RH_AMC_Depot: {
    codes: ['AMC_53d014bf'],
  },
  UNFPA_RH_AMC_SAYANA_Press: {
    codes: ['AMC_4752843e'],
  },
  UNFPA_RH_AMC_Norethisterone: {
    codes: ['AMC_542a34bf'],
  },
  UNFPA_RH_AMC_IUD: {
    codes: ['AMC_4718f43e', 'AMC_3b3994bf'],
  },
};

const UNFPA_RH_AMC_CHART_CONFIG = {
  UNFPA_RH_AMC_Male_condoms: {
    label: 'Male condoms',
    legendOrder: 0,
    color: '#FC1D26',
  },
  UNFPA_RH_AMC_Female_condoms: {
    label: 'Female condoms',
    legendOrder: 1,
    color: '#FD9155',
  },
  UNFPA_RH_AMC_COCs: {
    label: 'COCs',
    legendOrder: 2,
    color: '#FEDD64',
  },
  UNFPA_RH_AMC_POP: {
    label: 'POP',
    legendOrder: 3,
    color: '#81D75E',
  },
  UNFPA_RH_AMC_Implant_Contraceptives: {
    label: 'Implant Contraceptives',
    legendOrder: 4,
    color: '#0F7F3B',
  },
  UNFPA_RH_AMC_Jadelle: {
    label: 'Jadelle',
    legendOrder: 5,
    color: '#20C2CA',
  },
  UNFPA_RH_AMC_EC_2_dose: {
    label: 'EC',
    legendOrder: 6,
    color: '#40B7FC',
  },
  UNFPA_RH_AMC_Depot: {
    label: 'Depot',
    legendOrder: 7,
    color: '#0A4EAB',
  },
  UNFPA_RH_AMC_SAYANA_Press: {
    label: 'SAYANA Press',
    legendOrder: 8,
    color: '#8C5AFB',
  },
  UNFPA_RH_AMC_Norethisterone: {
    label: 'Norethisterone',
    legendOrder: 9,
    color: '#FD6AC4',
  },
  UNFPA_RH_AMC_IUD: {
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

exports.up = async function (db) {
  await db.runSql(`
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
    VALUES (
      'UNFPA_Reproductive_Health_Product_AMC',
      'sumPerMonth',
      '{
        "dataClasses": ${JSON.stringify(UNFPA_RH_AMC_DATA_CLASSES)},
        "filter": ${JSON.stringify(FILTER)},
        "periodType" : "month"
      }',
      '{
        "name": "Reproductive Health Product Average Monthly Consumption (AMC)",
        "type": "chart",
        "chartType": "line",
        "chartConfig": ${JSON.stringify(UNFPA_RH_AMC_CHART_CONFIG)},
        "periodGranularity": "month"
      }'
    );

    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{UNFPA_Reproductive_Health_Product_AMC}'
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUP_CODES_TO_ADD)})
    AND "organisationLevel" = 'Country';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = 'UNFPA_Reproductive_Health_Product_AMC';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", 'UNFPA_Reproductive_Health_Product_AMC')
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUP_CODES_TO_ADD)})
    AND "organisationLevel" = 'Country';
  `);
};

exports._meta = {
  version: 1,
};
