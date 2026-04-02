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

const oldDataClasses = {
  eGFR: {
    numerator: { dataSource: { type: 'group', codes: ['eGFR_Screenings'] } },
    denominator: { dataSource: { type: 'group', codes: ['DM_HTN_Cases'] } },
  },
  HBa1c: {
    numerator: { dataSource: { type: 'group', codes: ['HBa1c_Screenings'] } },
    denominator: { dataSource: { type: 'group', codes: ['DM_HTN_Cases'] } },
  },
  'Eye Check': {
    numerator: { dataSource: { type: 'group', codes: ['Eye_Check_Screenings'] } },
    denominator: { dataSource: { type: 'group', codes: ['DM_HTN_Cases'] } },
  },
  'Foot Check': {
    numerator: { dataSource: { type: 'group', codes: ['Foot_Check_Screenings'] } },
    denominator: { dataSource: { type: 'group', codes: ['DM_HTN_Cases'] } },
  },
  'Fasting Cholesterol': {
    numerator: { dataSource: { type: 'group', codes: ['Fasting_Cholesterol_Screenings'] } },
    denominator: { dataSource: { type: 'group', codes: ['DM_HTN_Cases'] } },
  },
};

const newDenominator = {
  dataSource: {
    type: 'single',
    codes: [
      'CH88',
      'CH89',
      'CH102',
      'CH86',
      'CH73',
      'CH105',
      'CH95',
      'CH103',
      'CH80',
      'CH82',
      'CH97',
      'CH72',
      'CH71',
      'CH110',
      'CH79',
      'CH106',
      'CH93',
      'CH108',
      'CH76',
      'CH91',
      'CH98',
      'CH109',
      'CH101',
      'CH83',
      'CH111',
      'CH81',
      'CH94',
      'CH78',
      'CH77',
      'CH107',
      'CH96',
      'CH85',
      'CH75',
      'CH90',
      'CH92',
      'CH104',
      'CH87',
      'CH74',
      'CH112',
      'CH84',
      'CH100',
      'CH99',
    ],
  },
};

const dashboardId = 'TO_CH_DM_HTN_Complications_Screening';

exports.up = function (db) {
  const newDataClasses = Object.entries(oldDataClasses).reduce(
    (dataClasses, [key, { numerator }]) => {
      const newDataClass = { numerator, denominator: newDenominator };
      return { ...dataClasses, [key]: newDataClass };
    },
    {},
  );
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{ "dataClasses": ${JSON.stringify(
      newDataClasses,
    )} }'
    WHERE id = '${dashboardId}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{ "dataClasses": ${JSON.stringify(
      oldDataClasses,
    )} }'
    WHERE id = '${dashboardId}';
  `);
};

exports._meta = {
  version: 1,
};
