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

const OLD_CHART_CONFIG = {
  UNFPA_RH_MOS_Condoms_male: {
    color: '#FC1D26',
    label: 'Condoms, male',
    legendOrder: 0,
  },
  UNFPA_RH_MOS_Condoms_female: {
    color: '#FD9155',
    label: 'Condoms, female',
    legendOrder: 1,
  },
  UNFPA_RH_MOS_Intra_Uterine_Device: {
    color: '#D9D9D9',
    label: 'IUD',
    legendOrder: 10,
  },
  UNFPA_RH_MOS_Levonorgestrel_30mcg_tablet: {
    color: '#81D75E',
    label: 'POP',
    legendOrder: 3,
  },
  UNFPA_RH_MOS_Jadelle_Contraceptive_Implant: {
    color: '#20C2CA',
    label: 'Jadelle',
    legendOrder: 5,
  },
  UNFPA_RH_MOS_Levonorgestrel_750mcg_tablet_pack_of_two: {
    color: '#40B7FC',
    label: 'EC',
    legendOrder: 6,
  },
  UNFPA_RH_MOS_Ethinylestradiol_levonorgestrel_30mcg_150mcg_tablet: {
    color: '#FEDD64',
    label: 'COC',
    legendOrder: 2,
  },
  UNFPA_RH_MOS_Medroxyprogesterone_acetate_104mgper0dot65ml_SAYANA_Press: {
    color: '#8C5AFB',
    label: 'SAYANA Press',
    legendOrder: 8,
  },
  UNFPA_RH_MOS_Norethisterone_enantate_200mgpermL_in_1mL_ampoule_oily_solution: {
    color: '#FD6AC4',
    label: 'Norethisterone',
    legendOrder: 9,
  },
  UNFPA_RH_MOS_Medroxyprogesterone_acetate_depot_injection_150mgpermL_in_1mL_vial: {
    color: '#0A4EAB',
    label: 'DMPA',
    legendOrder: 7,
  },
  UNFPA_RH_MOS_Etonogestrel_releasing_implant_single_rod_containing_68mg_of_etonogestrel: {
    color: '#0F7F3B',
    label: 'Implant',
    legendOrder: 4,
  },
};

const NEW_CHART_CONFIG = {
  ...OLD_CHART_CONFIG,
  max_reference_line: {
    referenceValue: 12,
    referenceLabel: 'MAX (12)',
    hideFromLegend: true,
  },
  min_reference_line: {
    referenceValue: 6,
    referenceLabel: 'MIN (6)',
    hideFromLegend: true,
  },
};

exports.up = function (db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "viewJson" = "viewJson" || '{"chartConfig": ${JSON.stringify(NEW_CHART_CONFIG)}}'
    WHERE "id"='UNFPA_Reproductive_Health_Product_MOS_National';
  `);
};

exports.down = function (db) {
  return db.runSql(`
  UPDATE "dashboardReport"
  SET "viewJson" = "viewJson" || '{"chartConfig": ${JSON.stringify(OLD_CHART_CONFIG)}}'
  WHERE "id"='UNFPA_Reproductive_Health_Product_MOS_National';
`);
};

exports._meta = {
  version: 1,
};
