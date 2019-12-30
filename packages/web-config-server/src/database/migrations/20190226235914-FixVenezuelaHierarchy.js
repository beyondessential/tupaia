'use strict';

const codeToParent = [
  ['AMA000', 'VE_Amazonas'],
  ['ADS0025', 'VE_Amazonas'],
  ['ADS0025', 'VE_Amazonas'],
  ['ANZ000', 'VE_Anzoategui'],
  ['ANZ001', 'VE_Anzoategui'],
  ['ANZ002', 'VE_Anzoategui'],
  ['ADS0011', 'VE_Anzoategui'],
  ['ADS0011', 'VE_Anzoategui'],
  ['APU000', 'VE_Apure'],
  ['ARA000', 'VE_Aragua'],
  ['ARA001', 'VE_Aragua'],
  ['ARA002', 'VE_Aragua'],
  ['BAR000', 'VE_Barinas'],
  ['ADS0017', 'VE_Barinas'],
  ['ADS0017', 'VE_Barinas'],
  ['BOL000', 'VE_Bolivar'],
  ['BOL001', 'VE_Bolivar'],
  ['ADS0026', 'VE_Bolivar'],
  ['ADS0026', 'VE_Bolivar'],
  ['DCA000', 'VE_DistritoCapital'],
  ['DCA001', 'VE_DistritoCapital'],
  ['DCA002', 'VE_DistritoCapital'],
  ['DCA003', 'VE_DistritoCapital'],
  ['DCA004', 'VE_DistritoCapital'],
  ['DCA005', 'VE_DistritoCapital'],
  ['DCA006', 'VE_DistritoCapital'],
  ['CAR000', 'VE_Carabobo'],
  ['CAR001', 'VE_Carabobo'],
  ['ADS0006', 'VE_Carabobo'],
  ['ADS0007', 'VE_Carabobo'],
  ['ADS0006', 'VE_Carabobo'],
  ['ADS0007', 'VE_Carabobo'],
  ['COJ000', 'VE_Cojedes'],
  ['DEL000', 'VE_Delta Amacuro'],
  ['ADS0000', 'VE_DistritoCapital'],
  ['ADS0001', 'VE_DistritoCapital'],
  ['ADS0000', 'VE_DistritoCapital'],
  ['ADS0001', 'VE_DistritoCapital'],
  ['ADS0020', 'VE_Falcon'],
  ['ADS0021', 'VE_Falcon'],
  ['ADS0020', 'VE_Falcon'],
  ['ADS0021', 'VE_Falcon'],
  ['FAL000', 'VE_Falcon'],
  ['ADS0018', 'VE_Falcon'],
  ['ADS0019', 'VE_Falcon'],
  ['ADS0018', 'VE_Falcon'],
  ['ADS0019', 'VE_Falcon'],
  ['GUA000', 'VE_Guarico'],
  ['LAR000', 'VE_Lara'],
  ['ADS0008', 'VE_Lara'],
  ['ADS0009', 'VE_Lara'],
  ['ADS0008', 'VE_Lara'],
  ['ADS0009', 'VE_Lara'],
  ['MER000', 'VE_Merida'],
  ['ADS0014', 'VE_Merida'],
  ['ADS0014', 'VE_Merida'],
  ['MIR000', 'VE_Miranda'],
  ['MIR001', 'VE_Miranda'],
  ['ADS0002', 'VE_Miranda'],
  ['ADS0003', 'VE_Miranda'],
  ['ADS0004', 'VE_Miranda'],
  ['ADS0005', 'VE_Miranda'],
  ['ADS0002', 'VE_Miranda'],
  ['ADS0003', 'VE_Miranda'],
  ['ADS0004', 'VE_Miranda'],
  ['ADS0005', 'VE_Miranda'],
  ['MON000', 'VE_Monagas'],
  ['NES000', 'VE_NuevaEsparta'],
  ['ADS0012', 'VE_NuevaEsparta'],
  ['ADS0013', 'VE_NuevaEsparta'],
  ['ADS0012', 'VE_NuevaEsparta'],
  ['ADS0013', 'VE_NuevaEsparta'],
  ['POR000', 'VE_Portuguesa'],
  ['ADS0010', 'VE_Portuguesa'],
  ['ADS0010', 'VE_Portuguesa'],
  ['SUC000', 'VE_Sucre'],
  ['TAC000', 'VE_Tachira'],
  ['TAC001', 'VE_Tachira'],
  ['ADS0015', 'VE_Tachira'],
  ['ADS0016', 'VE_Tachira'],
  ['ADS0015', 'VE_Tachira'],
  ['ADS0016', 'VE_Tachira'],
  ['TRU000', 'VE_Trujillo'],
  ['VAR000', 'VE_Vargas'],
  ['YAR000', 'VE_Yaracuy'],
  ['ZUL000', 'VE_Zulia'],
  ['ZUL001', 'VE_Zulia'],
  ['ADS0022', 'VE_Zulia'],
  ['ADS0023', 'VE_Zulia'],
  ['ADS0024', 'VE_Zulia'],
  ['ADS0022', 'VE_Zulia'],
  ['ADS0023', 'VE_Zulia'],
  ['ADS0024', 'VE_Zulia'],
];

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

exports.up = async function(db) {
  const queries = codeToParent.map(
    ([code, parent]) => `
    UPDATE "entity"
      SET "parent_code" = '${parent}'
      WHERE "code" = 'VE_${code}';
  `,
  );
  return db.runSql(queries.join('\n'));
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
