'use strict';

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

const GEOLOCATE_QUESTION_CODES = [
  "ANZFF6",
  "FF11",
  "FReSAA006",
  "MSUP1000",
];

const PHOTO_QUESTION_CODES = [
  "BCD97",
  "FF12",
  "FReSAA006A",
  "ANZFF7",
];

const escapeArray = (arr) => arr.map(x => `'${x}'`).join(", ");

exports.up = function(db) {
  return db.runSql(`
    UPDATE question 
    SET
      hook = 'entityImage'
    WHERE
      "code" IN (${ escapeArray(PHOTO_QUESTION_CODES) });

    UPDATE question 
    SET
      hook = 'entityCoordinates'
    WHERE
      "code" IN (${ escapeArray(GEOLOCATE_QUESTION_CODES) });
  `);
};

exports.down = function(db) {
  const allCodes = [...PHOTO_QUESTION_CODES, ...GEOLOCATE_QUESTION_CODES];
  return db.runSql(`
    UPDATE question 
    SET
      hook = NULL
    WHERE
      "code" IN (${ escapeArray(allCodes) });
  `);
};

exports._meta = {
  "version": 1
};
