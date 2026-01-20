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

const THRESHOLD_LEVEL_INDICATORS = [
  {
    code: 'PSSS_DIA_Alert_Threshold_Crossed',
    oldFormula: 'PSSS_DIA_Site_Average > PSSS_DIA_Alert_Threshold_Level',
    newFormula:
      'PSSS_DIA_Total_Cases > 1 and PSSS_DIA_Site_Average > PSSS_DIA_Alert_Threshold_Level',
  },
  {
    code: 'PSSS_ILI_Alert_Threshold_Crossed',
    oldFormula: 'PSSS_ILI_Site_Average > PSSS_ILI_Alert_Threshold_Level',
    newFormula:
      'PSSS_ILI_Total_Cases > 1 and PSSS_ILI_Site_Average > PSSS_ILI_Alert_Threshold_Level',
  },
  {
    code: 'PSSS_PF_Alert_Threshold_Crossed',
    oldFormula: 'PSSS_PF_Site_Average > PSSS_PF_Alert_Threshold_Level',
    newFormula: 'PSSS_PF_Total_Cases > 1 and PSSS_PF_Site_Average > PSSS_PF_Alert_Threshold_Level',
  },
  {
    code: 'PSSS_DLI_Alert_Threshold_Crossed',
    oldFormula: 'PSSS_DLI_Site_Average > PSSS_DLI_Alert_Threshold_Level',
    newFormula:
      'PSSS_DLI_Total_Cases > 1 and PSSS_DLI_Site_Average > PSSS_DLI_Alert_Threshold_Level',
  },

  {
    code: 'PSSS_Confirmed_DIA_Alert_Threshold_Crossed',
    oldFormula: 'PSSS_Confirmed_DIA_Site_Average > PSSS_Confirmed_DIA_Alert_Threshold_Level',
    newFormula:
      'PSSS_Confirmed_DIA_Cases > 1 and PSSS_Confirmed_DIA_Site_Average > PSSS_Confirmed_DIA_Alert_Threshold_Level',
  },
  {
    code: 'PSSS_Confirmed_ILI_Alert_Threshold_Crossed',
    oldFormula: 'PSSS_Confirmed_ILI_Site_Average > PSSS_Confirmed_ILI_Alert_Threshold_Level',
    newFormula:
      'PSSS_Confirmed_ILI_Cases > 1 and PSSS_Confirmed_ILI_Site_Average > PSSS_Confirmed_ILI_Alert_Threshold_Level',
  },
  {
    code: 'PSSS_Confirmed_PF_Alert_Threshold_Crossed',
    oldFormula: 'PSSS_Confirmed_PF_Site_Average > PSSS_Confirmed_PF_Alert_Threshold_Level',
    newFormula:
      'PSSS_Confirmed_PF_Cases > 1 and PSSS_Confirmed_PF_Site_Average > PSSS_Confirmed_PF_Alert_Threshold_Level',
  },
  {
    code: 'PSSS_Confirmed_DLI_Alert_Threshold_Crossed',
    oldFormula: 'PSSS_Confirmed_DLI_Site_Average > PSSS_Confirmed_DLI_Alert_Threshold_Level',
    newFormula:
      'PSSS_Confirmed_DLI_Cases > 1 and PSSS_Confirmed_DLI_Site_Average > PSSS_Confirmed_DLI_Alert_Threshold_Level',
  },
];

exports.up = async function (db) {
  await Promise.all(
    THRESHOLD_LEVEL_INDICATORS.map(async ({ code, newFormula }) =>
      db.runSql(`
      UPDATE indicator
      SET config = jsonb_set(config, '{formula}', '"${newFormula}"')
      WHERE code = '${code}';
    `),
    ),
  );
};

exports.down = async function (db) {
  await Promise.all(
    THRESHOLD_LEVEL_INDICATORS.map(async ({ code, oldFormula }) =>
      db.runSql(`
      UPDATE indicator
      SET config = jsonb_set(config, '{formula}', '"${oldFormula}"')
      WHERE code = '${code}';
    `),
    ),
  );
};

exports._meta = {
  version: 1,
};
