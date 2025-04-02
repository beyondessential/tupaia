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

exports.up = function (db) {
  return db.runSql(`
    update entity set region = (select st_simplify(region::geometry, 0.01) as region from entity where code = 'FJ') where code = 'FJ';
    update entity set region = (select st_simplify(region::geometry, 0.01) as region from entity where code = 'NR') where code = 'NR';
    update entity set region = (select st_simplify(region::geometry, 0.01) as region from entity where code = 'WS') where code = 'WS';
    update entity set region = (select st_simplify(region::geometry, 0.01) as region from entity where code = 'MH') where code = 'MH';
    update entity set region = (select st_simplify(region::geometry, 0.01) as region from entity where code = 'FM') where code = 'FM';
    update entity set region = (select st_simplify(region::geometry, 0.01) as region from entity where code = 'KI') where code = 'KI';
    update entity set region = (select st_simplify(region::geometry, 0.01) as region from entity where code = 'CK') where code = 'CK';
    update entity set region = (select st_simplify(region::geometry, 0.01) as region from entity where code = 'CI') where code = 'CI';
    update entity set region = (select st_simplify(region::geometry, 0.01) as region from entity where code = 'PG') where code = 'PG';
    update entity set region = (select st_simplify(region::geometry, 0.01) as region from entity where code = 'TO') where code = 'TO';
    update entity set region = (select st_simplify(region::geometry, 0.01) as region from entity where code = 'VU') where code = 'VU';
    update entity set region = (select st_simplify(region::geometry, 0.01) as region from entity where code = 'LA') where code = 'LA';
    update entity set region = (select st_simplify(region::geometry, 0.01) as region from entity where code = 'DL') where code = 'DL';
    update entity set region = (select st_simplify(region::geometry, 0.01) as region from entity where code = 'SB') where code = 'SB';
    update entity set region = (select st_simplify(region::geometry, 0.01) as region from entity where code = 'TK') where code = 'TK';
    update entity set region = (select st_simplify(region::geometry, 0.01) as region from entity where code = 'PH') where code = 'PH';
    update entity set region = (select st_simplify(region::geometry, 0.01) as region from entity where code = 'VE') where code = 'VE';
`);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
