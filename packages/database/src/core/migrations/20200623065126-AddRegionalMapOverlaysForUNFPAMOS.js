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

const products = {
  MOS_3b3444bf: 'Condoms, male',
  MOS_a162942e: 'Condom, male, varied',
  MOS_bf4be518: 'Condoms, female',
  MOS_402924bf: 'Ethinylestradiol & levonorgestrel 30mcg & 150mcg tablet',
  MOS_47d584bf: 'Levonorgestrel 30mcg tablet',
  MOS_3ff944bf: 'Etonogestrel-releasing implant (single rod containing 68mg of etonogestrel)',
  MOS_d2d28620: 'Jadelle Contraceptive Implant',
  MOS_47fb04bf: 'Levonorgestrel 750mcg tablet (pack of two)',
  MOS_47fe44bf: 'Levonorgestrel 1.5mg tablet',
  MOS_53d014bf: 'Medroxyprogesterone acetate depot injection 150mg/mL in 1mL vial',
  MOS_4752843e: 'Medroxyprogesterone acetate 104mg/0.65ml (SAYANA Press)',
  MOS_542a34bf: 'Norethisterone enantate 200mg/mL in 1mL ampoule oily solution',
  MOS_4718f43e: 'Intra Uterine Device',
  MOS_3b3994bf: 'Copper containing device',
};

const insertMOHProduct = async (db, productCode, productName) => {
  return db.runSql(`
    INSERT INTO "public"."mapOverlay"("id","name","groupName","userGroup","dataElementCode","displayType","customColors","isDataRegional","values","hideFromMenu","hideFromPopup","hideFromLegend","linkedMeasures","sortOrder","measureBuilderConfig","measureBuilder","presentationOptions","countryCodes","projectCodes")
    VALUES
    (E'RH_${productCode}_Regional',E'${productName}',E'RH Commodity Months of Stock (National Warehouse)',E'UNFPA',E'${productCode}',E'shading',NULL,TRUE,E'[{"name": "0", "color": "Red", "value": "0"}, {"name": "1-2", "color": "Orange", "value": "1-2"}, {"name": "3-6", "color": "Green", "value": "3-6"}, {"name": ">6", "color": "Yellow", "value": ">6"}, {"name": "No data", "color": "Grey", "value": "null"}]',FALSE,FALSE,FALSE,NULL,0,E'{"groups": {"0": {"value": 0, "operator": "="}, ">6": {"value": 6, "operator": ">"}, "1-2": {"value": [1, 2], "operator": "range"}, "3-6": {"value": [3, 6], "operator": "range"}}, "mapDataToCountries": true, "measureBuilderConfig": {"filter": {"organisationUnit": {"in": ["TO_CPMS", "KI_GEN", "VU_1180_20", "SB_500092"]}}, "dataSourceType": "custom", "aggregationType": "MOST_RECENT"}}',E'groupData',E'{"measureLevel": "Country"}',E'{unfpa}',E'{unfpa,explore}');
  `);
};

exports.up = async function (db) {
  const mapJobs = Object.entries(products).map(([code, name]) => insertMOHProduct(db, code, name));

  return Promise.all(mapJobs);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
