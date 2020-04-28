'use strict';

var dbm;
var type;
var seed;

const UNFPA_RH_MOS_DATA_CLASSES = {
  "UNFPA_RH_MOS_Condoms_male": {
    "codes": ["MOS_3b3444bf"]
  },
  "UNFPA_RH_MOS_Condom_male_varied": {
    "codes": ["MOS_a162942e"]
  },
  "UNFPA_RH_MOS_Condoms_female": {
    "codes": ["MOS_bf4be518"]
  },
  "UNFPA_RH_MOS_Ethinylestradiol_levonorgestrel_30mcg_150mcg_tablet": {
    "codes": ["MOS_402924bf"]
  },
  "UNFPA_RH_MOS_Levonorgestrel_30mcg_tablet": {
    "codes": ["MOS_47d584bf"]
  },
  "UNFPA_RH_MOS_Etonogestrel_releasing_implant_single_rod_containing_68mg_of_etonogestrel)": {
    "codes": ["MOS_3ff944bf"]
  },
  "UNFPA_RH_MOS_Jadelle_Contraceptive_Implant": {
    "codes": ["MOS_d2d28620"]
  },
  "UNFPA_RH_MOS_Levonorgestrel_750mcg_tablet_pack_of_two": {
    "codes": ["MOS_47fb04bf"]
  },
  "UNFPA_RH_MOS_Levonorgestrel_1dot5mg_tablet": {
    "codes": ["MOS_47fe44bf"]
  },
  "UNFPA_RH_MOS_Medroxyprogesterone_acetate_depot_injection_150mgpermL_in_1mL_vial": {
    "codes": ["MOS_53d014bf"]
  },
  "UNFPA_RH_MOS_Medroxyprogesterone_acetate_104mgper0.65ml_SAYANA_Press": {
    "codes": ["MOS_4752843e"]
  },
  "UNFPA_RH_MOS_Norethisterone_enantate_200mgpermL_in_1mL_ampoule_oily_solution": {
    "codes": ["MOS_542a34bf"]
  },
  "UNFPA_RH_MOS_Intra_Uterine_Device": {
    "codes": ["MOS_4718f43e"]
  },
  "UNFPA_RH_MOS_Copper_containing_device": {
    "codes": ["MOS_3b3994bf"]
  }
}

const UNFPA_RH_MOS_CHART_CONFIG = {
  "UNFPA_RH_MOS_Condoms_male": {
    "label": "Condoms, male",
    "legendOrder" : 0
  },
  "UNFPA_RH_MOS_Condom_male_varied": {
    "label": "Condom, male, varied",
    "legendOrder" : 1
  },
  "UNFPA_RH_MOS_Condoms_female": {
    "label": "Condoms, female",
    "legendOrder" : 2
  },
  "UNFPA_RH_MOS_Ethinylestradiol_levonorgestrel_30mcg_150mcg_tablet": {
    "label": "Ethinylestradiol & levonorgestrel 30mcg & 150mcg tablet",
    "legendOrder" : 3
  },
  "UNFPA_RH_MOS_Levonorgestrel_30mcg_tablet": {
    "label": "Levonorgestrel 30mcg tablet",
    "legendOrder" : 4
  },
  "UNFPA_RH_MOS_Etonogestrel_releasing_implant_single_rod_containing_68mg_of_etonogestrel": {
    "label": "Etonogestrel-releasing implant (single rod containing 68mg of etonogestrel)",
    "legendOrder" : 5
  },
  "UNFPA_RH_MOS_Jadelle_Contraceptive_Implant": {
    "label": "Jadelle Contraceptive Implant",
    "legendOrder" : 6
  },
  "UNFPA_RH_MOS_Levonorgestrel_750mcg_tablet_pack_of_two": {
    "label": "Levonorgestrel 750mcg tablet (pack of two)",
    "legendOrder" : 7
  },
  "UNFPA_RH_MOS_Levonorgestrel_1dot5mg_tablet": {
    "label": "Levonorgestrel 1.5mg tablet",
    "legendOrder" : 8
  },
  "UNFPA_RH_MOS_Medroxyprogesterone_acetate_depot_injection_150mgpermL_in_1mL_vial": {
    "label": "Medroxyprogesterone acetate depot injection 150mg/mL in 1mL vial",
    "legendOrder" : 9
  },
  "UNFPA_RH_MOS_Medroxyprogesterone_acetate_104mgper0.65ml_SAYANA_Press": {
    "label": "Medroxyprogesterone acetate 104mg/0.65ml (SAYANA Press)",
    "legendOrder" : 10
  },
  "UNFPA_RH_MOS_Norethisterone_enantate_200mgpermL_in_1mL_ampoule_oily_solution": {
    "label": "Norethisterone enantate 200mg/mL in 1mL ampoule oily solution",
    "legendOrder" : 11
  },
  "UNFPA_RH_MOS_Intra_Uterine_Device": {
    "label": "Intra Uterine Device",
    "legendOrder" : 11
  },
  "UNFPA_RH_MOS_Copper_containing_device": {
    "label": "Copper containing device",
    "legendOrder" : 12
  }
}
/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(`
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
    VALUES (
      'UNFPA_Reproductive_Health_Product_MOS',
      'sumPerMonth',
      '{
        "dataClasses": ${JSON.stringify(UNFPA_RH_MOS_DATA_CLASSES)},
        "periodType" : "month"
      }',
      '{
        "name": "Reproductive Health Products Months of Stock (MOS)",
        "type": "chart",
        "chartType": "line",
        "valueType": "text",
        "chartConfig": ${JSON.stringify(UNFPA_RH_MOS_CHART_CONFIG)},
        "periodGranularity": "month"
      }'
    );

  UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{UNFPA_Reproductive_Health_Product_MOS}'
    WHERE code = 'DL_Unfpa_Country';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = 'UNFPA_Reproductive_Health_Product_MOS';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", '"UNFPA_Reproductive_Health_Product_MOS"')
    WHERE code = 'DL_Unfpa_Country';
  `);
};

exports._meta = {
  "version": 1
};
