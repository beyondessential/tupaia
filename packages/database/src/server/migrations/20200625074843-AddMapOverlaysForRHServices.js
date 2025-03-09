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

const products = {
  'Family Planning Services': 'RHS4UNFPA807',
  'ANC Services': 'RHS3UNFPA4121',
  'PNC Services': 'RHS3UNFPA464',
  'Delivery Service': 'RHS3UNFPA536',
};

const insertMapOverlay = (db, code, name) => {
  return db.runSql(`
  insert into "mapOverlay"("id","name","groupName","userGroup","dataElementCode","displayType","measureBuilderConfig","measureBuilder","presentationOptions","countryCodes","projectCodes")
  values(
    'RH_Available_${code}',
    '${name}',
    'RH Services Available',
    'UNFPA',
    '${code}',
    'color',
    '{}',
    'valueForOrgGroup',
    '{"scaleType": "time", "measureLevel": "Facility"}',
    '{VU,MH,TO,FM,SB,WS,FJ,KI}',
    '{unfpa, explore}'
  );
`);
};

exports.up = function (db) {
  const mapJobs = Object.entries(products).map(([name, code]) => insertMapOverlay(db, code, name));

  return Promise.all(mapJobs);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
