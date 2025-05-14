'use strict';

var dbm;
var type;
var seed;

// These data elements already have their corresponding data_sources created
const DATA_ELEMENT_CODES = [
  'DP1D',
  'DP94',
  'DP85',
  'DP86',
  'DP87',
  'DP88',
  'DP89',
  'DP90',
  'DP91',
  'DP92',
  'DP93',
  'FF18',
  'FF14',
  'FF15',
  'FF16',
  'FF17',
  'FJBCD1A',
  'FJBCD2',
  'FJBCD3',
  'FJBCD4',
  'FJBCD5',
  'FJBCD6',
  'FJBCD7',
  'FJBCD8',
  'FJBCD9',
  'FijiBCSC001',
  'FijiBCSC1',
  'FijiBCSC2',
  'FijiBCSC3',
  'FijiBCSC4',
  'FijiBCSC5',
  'FijiBCSC6',
  'FijiBCSC7',
  'FijiBCSC8',
  'FijiBCSC9',
  'FijiBCSC10',
  'FijiBCSC11',
  'FijiBCSC12',
  'FijiBCSC13',
  'FijiBCSC14',
  'FijiBCSC15',
  'FijiBCSC16',
  'FijiBCSC17',
  'FijiBCSC18',
  'FijiBCSC19',
  'FijiBCSC20',
  'FijiBCSC22',
  'FijiBCSC23',
  'FijiBCSC24',
  'FijiBCSC25',
  'FijiBCSC26',
  'FijiBCSC27',
  'FijiBCSC28',
  'FijiBCSC29',
  'FijiBCSC30',
  'FijiBCSC31',
  'FijiBCSC32',
  'FijiBCSC33',
  'FijiBCSC34',
  'FijiBCSC35',
  'FijiBCSC36',
  'FijiBCSC37',
  'FijiBCSC38',
  'FijiBCSC39',
  'FijiBCSC40',
  'FijiBCSC41',
  'FijiBCSC42',
  'FijiBCSC43',
  'FijiBCSC44',
  'FijiBCSC45',
  'FijiBCSC46',
  'FijiBCSC47',
  'FijiBCSC48',
  'FijiBCSC164',
  'FijiBCSC165',
  'FijiBCSC166',
  'FijiBCSC167',
  'FijiBCSC168',
  'FijiBCSC169',
  'FijiBCSC170',
  'FijiBCSC171',
  'FijiBCSC172',
  'FijiBCSC173',
  'FijiBCSC174',
  'FijiBCSC175',
  'FijiBCSC176',
  'FijiBCSC177',
  'FijiBCSC178',
  'FijiBCSC179',
  'FijiBCSC180',
  'FijiBCSC181',
  'FijiBCSC182',
  'FijiBCSC184',
  'FijiBCSC185',
  'FijiBCSC186',
  'FijiBCSC187',
  'FijiBCSC188',
  'FijiBCSC189',
  'FijiBCSC190',
  'FijiBCSC191',
  'FijiBCSC192',
  'FijiBCSC193',
  'FJBCD10',
  'FJBCD11',
  'FJBCD12',
  'FJBCD13',
  'FJBCD14',
  'FJBCD15',
  'FJBCD17',
  'FJBCD18',
  'FJBCD19',
  'FJBCD20',
  'FJBCD21',
  'FJBCD22',
  'SS226',
  'SS229',
  'SS234',
  'SS235',
  'SS222',
  'SS223',
  'SS227',
  'SS230',
  'SS232',
  'SS233',
  'SS224',
  'SS225',
  'SS228',
  'SS231',
  'SAS001',
  'SAS002',
  'SAS003',
  'SAS004',
  'SAS005',
  'SAS007',
  'SAS035',
  'SAS036',
  'SAS037',
  'SAS038',
  'SAS039',
  'SAS009',
  'SAS011',
  'SAS015',
  'SAS017',
  'SAS018',
  'SAS019',
  'SAS020',
  'SAS021',
  'SAS022',
  'SAS029',
  'SAS030',
  'SAS031',
  'SAS033',
  'SAS034',
  'UCC3',
  'UCC4',
  'UCC5',
  'UCC10',
  'UCC11',
  'UCC13',
  'UCC15',
  'UCC18',
  'UCC19',
];

const changeDataSourceService = async (db, code, serviceType = 'tupaia') =>
  db.runSql(`
    update data_source 
    set service_type = '${serviceType}'
    where code = '${code}'
  `);

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  for (const code of DATA_ELEMENT_CODES) {
    await changeDataSourceService(db, code);
  }
};

exports.down = async function (db) {
  for (const code of DATA_ELEMENT_CODES) {
    await changeDataSourceService(db, code, 'dhis');
  }
};

exports._meta = {
  version: 1,
};
