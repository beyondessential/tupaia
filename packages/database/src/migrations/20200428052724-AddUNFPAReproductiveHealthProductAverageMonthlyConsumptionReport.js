'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const UNFPA_RH_AMC_DATA_CLASSES = {
  "UNFPA_RH_AMC_Male_condoms": {
    "codes": ["AMC_3b3444bf"]
  },
  "UNFPA_RH_AMC_Male_condoms_varied": {
    "codes": ["AMC_a162942e"]
  },
  "UNFPA_RH_AMC_Female_condoms": {
    "codes": ["AMC_bf4be518"]
  },
  "UNFPA_RH_AMC_COCs": {
    "codes": ["AMC_402924bf"]
  },
  "UNFPA_RH_AMC_POP": {
    "codes": ["AMC_47d584bf"]
  },
  "UNFPA_RH_AMC_Implant_Contraceptives": {
    "codes": ["AMC_3ff944bf"]
  },
  "UNFPA_RH_AMC_Jadelle": {
    "codes": ["AMC_d2d28620"]
  },
  "UNFPA_RH_AMC_EC_2_dose": {
    "codes": ["AMC_47fb04bf"]
  },
  "UNFPA_RH_AMC_EC_single_dose": {
    "codes": ["ACM_47fe44bf"]
  },
  "UNFPA_RH_AMC_Depot": {
    "codes": ["AMC_53d014bf"]
  },
  "UNFPA_RH_AMC_SAYANA_Press": {
    "codes": ["AMC_4752843e"]
  },
  "UNFPA_RH_AMC_Norethisterone": {
    "codes": ["AMC_542a34bf"]
  },
  "UNFPA_RH_AMC_IUD": {
    "codes": ["AMC_4718f43e"]
  },
  "UNFPA_RH_AMC_Copper_IUD": {
    "codes": ["AMC_3b3994bf"]
  }
};

const UNFPA_RH_AMC_CHART_CONFIG = {
  "UNFPA_RH_AMC_Male_condoms": {
    "label": "Male condoms",
    "legendOrder" : 0
  },
  "UNFPA_RH_AMC_Male_condoms_varied": {
    "label": "Male condoms, varied",
    "legendOrder" : 1
  },
  "UNFPA_RH_AMC_Female_condoms": {
    "label": "Female condoms",
    "legendOrder" : 2
  },
  "UNFPA_RH_AMC_COCs": {
    "label": "COCs",
    "legendOrder" : 3
  },
  "UNFPA_RH_AMC_POP": {
    "label": "POP",
    "legendOrder" : 4
  },
  "UNFPA_RH_AMC_Implant_Contraceptives": {
    "label": "Implant Contraceptives",
    "legendOrder" : 5
  },
  "UNFPA_RH_AMC_Jadelle": {
    "label": "Jadelle",
    "legendOrder" : 6
  },
  "UNFPA_RH_AMC_EC_2_dose": {
    "label": "EC (2 dose)",
    "legendOrder" : 7
  },
  "UNFPA_RH_AMC_EC_single_dose": {
    "label": "EC (single dose)",
    "legendOrder" : 8
  },
  "UNFPA_RH_AMC_Depot": {
    "label": "Depot",
    "legendOrder" : 9
  },
  "UNFPA_RH_AMC_SAYANA_Press": {
    "label": "SAYANA Press",
    "legendOrder" : 10
  },
  "UNFPA_RH_AMC_Norethisterone": {
    "label": "Norethisterone",
    "legendOrder" : 11
  },
  "UNFPA_RH_AMC_IUD": {
    "label": "IUD",
    "legendOrder" : 11
  },
  "UNFPA_RH_AMC_Copper_IUD": {
    "label": "Copper IUD",
    "legendOrder" : 12
  }
};

const ORG_UNIT_CODES = [
  'TO_CPMS', 'KI_GEN', 'VU_1180_20', 'SB_500092', 'DL_2'
];

const FILTER = {
  organisationUnit: {
    in: ORG_UNIT_CODES
  },
};

exports.up = async function(db) {
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
        "valueType": "text",
        "chartConfig": ${JSON.stringify(UNFPA_RH_AMC_CHART_CONFIG)},
        "periodGranularity": "month"
      }'
    );

    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{UNFPA_Reproductive_Health_Product_AMC}'
    WHERE code = 'DL_Unfpa_Country'
    AND "organisationLevel" = 'Country';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{UNFPA_Reproductive_Health_Product_AMC}'
    WHERE code = 'TO_Unfpa_Country'
    AND "organisationLevel" = 'Country';
  `);
};

exports.down = async function(db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = 'UNFPA_Reproductive_Health_Product_AMC';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", 'UNFPA_Reproductive_Health_Product_AMC')
    WHERE code = 'DL_Unfpa_Country'
    AND "organisationLevel" = 'Country';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", 'UNFPA_Reproductive_Health_Product_AMC')
    WHERE code = 'TO_Unfpa_Country'
    AND "organisationLevel" = 'Country';
  `);
};

exports._meta = {
  "version": 1
};
