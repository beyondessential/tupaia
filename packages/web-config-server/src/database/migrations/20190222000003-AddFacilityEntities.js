'use strict';

import { insertObject } from '../migrationUtilities';

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

function makePoint(p) {
  if (!p || p.length !== 2) {
    return {};
  }

  const [lat, lng] = p;
  return { point: `POINT(${lng} ${lat})` };
}

function makeDataEntry(sourceData) {
  return {
    id: sourceData.organisationUnitCode,
    code: sourceData.organisationUnitCode,
    name: sourceData.name,
    type: 'facility',
    ...makePoint(sourceData.coordinates),
  };
}

const CK = require('../migrationData/20190222000003-AddFacilityEntities/CK.json');
const DL = require('../migrationData/20190222000003-AddFacilityEntities/DL.json');
const KI = require('../migrationData/20190222000003-AddFacilityEntities/KI.json');
const SB = require('../migrationData/20190222000003-AddFacilityEntities/SB.json');
const TK = require('../migrationData/20190222000003-AddFacilityEntities/TK.json');
const TO = require('../migrationData/20190222000003-AddFacilityEntities/TO.json');
const VU = require('../migrationData/20190222000003-AddFacilityEntities/VU.json');

const facilities = [
  ...CK.entities.map(makeDataEntry),
  ...DL.entities.map(makeDataEntry),
  ...KI.entities.map(makeDataEntry),
  ...SB.entities.map(makeDataEntry),
  ...TK.entities.map(makeDataEntry),
  ...TO.entities.map(makeDataEntry),
  ...VU.entities.map(makeDataEntry),
];

exports.up = async function(db) {
  return Promise.all(facilities.map(f => insertObject(db, 'entity', f)));
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "entity"
      WHERE "type" = 'facility';
  `);
};

exports._meta = {
  version: 1,
};
