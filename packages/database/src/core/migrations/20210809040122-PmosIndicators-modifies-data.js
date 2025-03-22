'use strict';

import { insertObject, generateId } from '../utilities';

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

const getIndicator = (code, dataElements) => ({
  id: generateId(),
  code,
  builder: 'analyticArithmetic',
  config: {
    formula: dataElements.join('+'),
    aggregation: 'SUM_EACH_MONTH',
    defaultValues: Object.fromEntries(dataElements.map(d => [d, 0])),
  },
});

const MAPPINGS = [
  ['An_Farauti', ['PMOS_AM21', 'PMOS_AM22']],
  ['An_Koliensis', ['PMOS_AM23', 'PMOS_AM24']],
  ['An_Punctulatus', ['PMOS_AM25', 'PMOS_AM26']],
  ['Ae_Aegypti', ['PMOS_AM27', 'PMOS_AM28']],
  ['Ae_Albopictus', ['PMOS_AM29', 'PMOS_AM30']],
  ['Ae_Cooki', ['PMOS_AM31', 'PMOS_AM32']],
  ['Ae_Hensilli', ['PMOS_AM33', 'PMOS_AM34']],
  ['Ae_Marshallensis', ['PMOS_AM35', 'PMOS_AM36']],
  ['Ae_Polynesiensis', ['PMOS_AM38', 'PMOS_AM37']],
  ['Ae_Rotumae', ['PMOS_AM39', 'PMOS_AM40']],
  ['Ae_Scutellaris', ['PMOS_AM41', 'PMOS_AM42']],
  ['Ae_Vigilax', ['PMOS_AM43', 'PMOS_AM44']],
  ['Cx_Annulirostris', ['PMOS_AM46', 'PMOS_AM45']],
  ['Cx_Quinquefasciatus', ['PMOS_AM47', 'PMOS_AM48']],
  ['Cx_Sitiens', ['PMOS_AM49', 'PMOS_AM50']],
  ['Mn_Uniformis', ['PMOS_AM51', 'PMOS_AM52']],
  ['Anopheles', ['PMOS_An_Farauti', 'PMOS_An_Koliensis', 'PMOS_An_Punctulatus']],
  [
    'Aedes',
    [
      'PMOS_Ae_Aegypti',
      'PMOS_Ae_Albopictus',
      'PMOS_Ae_Cooki',
      'PMOS_Ae_Hensilli',
      'PMOS_Ae_Marshallensis',
      'PMOS_Ae_Polynesiensis',
      'PMOS_Ae_Rotumae',
      'PMOS_Ae_Scutellaris',
      'PMOS_Ae_Vigilax',
    ],
  ],
  ['Culex', ['PMOS_Cx_Annulirostris', 'PMOS_Cx_Quinquefasciatus', 'PMOS_Cx_Sitiens']],
  ['Mansonia', ['PMOS_Mn_Uniformis']],
];

exports.up = async function (db) {
  Promise.all(
    MAPPINGS.map(async ([typeName, dataElements]) => {
      const code = `PMOS_${typeName}`;
      const indicator = getIndicator(code, dataElements);
      await insertObject(db, 'indicator', indicator);
      await insertObject(db, 'data_source', {
        id: generateId(),
        code,
        type: 'dataElement',
        service_type: 'indicator',
        config: { isDataRegional: false },
      });
    }),
  );
};

exports.down = async function (db) {
  return db.runSql(`
    DELETE FROM indicator
    WHERE code like '%PMOS%';
  `);
};

exports._meta = {
  version: 1,
};
