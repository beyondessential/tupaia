'use strict';

var dbm;
var type;
var seed;

const NEW_DATA_ELEMENT_TO_STRING = {
  // Removed elements
  // SchFF008:
  //  'Has the school received (hard copies of) learning materials for (remote) communities with limited internet and TV access',
  // SchFF009:
  //  'Has the school been provided with cleaning/disinfecting materials and guidance provided on their use',
  // SchFF010:
  //  'Has the school received training on safe school protocols (COVID-19 prevention and control)',
  // SchFF016: 'Is the school provided with psychosocial support',
  // SchFF009a: 'Has the school been provided with hygiene kits',
  // SchFF003: 'Does this school have a Dormitory',

  // Changed elements
  SchFF001: 'Electricity available',
  SchFF002: 'Internet connection available',
  BCD29_event: 'Access to clean water',
  BCD32_event: 'Functioning toilets',
  SchFF004: 'Functioning hand washing facilities',
  SchFF011: 'Remedial support provided to students',
  SchQuar001: 'Currently used as quarantine centre',

  // New elements
  SchCVD002: 'Has been used as quarantine centre',
  SchCVD003: 'Disinfected by district health office',
  SchCVD009: 'Functioning water filters',
  SchCVD004: 'Textbooks and additional learning material received',
  SchCVD005: 'Students have their own textbooks',
  SchCVD006: 'COVID-19 posters and materials received',
  SchCVD024: 'Thermometer(s) received for taking temperature',
  SchCVD007: 'Hygiene promotion training in last 3 years',
  SchCVD012: 'Functioning TV, satellite receiver and dish set',
  SchCVD013: 'Functioning notebook/laptop or desktop computer',
  SchCVD015: 'Functioning projector',
  SchCVD016: 'Teachers follow the MoES education shows on TV',
  SchCVD017: 'Students follow the MoES education shows on TV',
  SchCVD018: 'Teachers using resources on MoES website',
  SchCVD019: 'Training on digital literacy and MoES website resources received',
  SchCVD020: 'Support implementing catch-up/remedial teaching programmes received',
  SchCVD021: 'Students require psychosocial support',
};

const OLD_DATA_ELEMENT_TO_STRING = {
  SchFF001: 'Electricity available in school',
  SchFF002: 'Internet connection available in school',
  SchFF003: 'Does this school have a Dormitory',
  SchFF004: 'Are there hand washing facilities available?',
  SchFF008:
    'Has the school received (hard copies of) learning materials for (remote) communities with limited internet and TV access',
  SchFF009:
    'Has the school been provided with cleaning/disinfecting materials and guidance provided on their use',
  SchFF010:
    'Has the school received training on safe school protocols (COVID-19 prevention and control)',
  SchFF011: 'Is the school implementing remedial education programmes',
  SchFF016: 'Is the school provided with psychosocial support',
  SchFF009a: 'Has the school been provided with hygiene kits',
  SchQuar001: 'Has this school been identified as a COVID-19 Quarantine Center?',
  BCD29_event: 'Does this school have a functioning water supply?',
  BCD32_event: 'Does this school have a functioning toilet?',
};

const REPORT_ID = 'LAOS_SCHOOL_BINARY_TABLE';

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
    UPDATE "dashboardReport" 
    SET "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{dataElementToString}', '${JSON.stringify(
      NEW_DATA_ELEMENT_TO_STRING,
    )}')
    WHERE id = '${REPORT_ID}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "dashboardReport" 
    SET "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{dataElementToString}', '${JSON.stringify(
      OLD_DATA_ELEMENT_TO_STRING,
    )}')
    WHERE id = '${REPORT_ID}';
  `);
};

exports._meta = {
  version: 1,
};
