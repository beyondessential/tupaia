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

const FACILITIES_TO_REMOVE = [
  'LA_XAXIE',
  'LA_VCSAN',
  'LA_VCPAR',
  'LA_PHSAM',
  'LA_PHMAI',
  'LA_PHYOT',
  'LA_PHKHO',
  'LA_LUNAL',
  'LA_LUSIN',
  'LA_OUNGA',
  'LA_OUNAM',
  'LA_OUHOU',
  'LA_OUBEN',
  'LA_BORTON',
  'LA_BORPHA',
  'LA_BORMUA',
  'LA_LPPHT',
  'LA_LPPHK',
  'LA_LPPHN',
  'LA_LPNGO',
  'LA_LPNAN',
  'LA_LPVIE',
  'LA_LPPAK',
  'LA_LPNAM',
  'LA_HOSAM',
  'LA_HOHIE',
  'LA_HOXIE',
  'LA_XAPAK',
  'LA_XAKEN',
  'LA_XAHON',
  'LA_XIKHA',
  'LA_XINON',
  'LA_XIKHO',
  'LA_XIMOK',
  'LA_VISAN',
  'LA_VIMOU',
  'LA_VIMUA',
  'LA_VIVAN',
  'LA_BOXAY',
  'LA_BOVIE',
  'LA_BOBOR',
  'LA_BOKHA',
  'LA_KHYOM',
  'LA_KHBUA',
  'LA_KHXAY',
  'LA_KHNAK',
  'LA_SAVSON',
  'LA_SAVXAY',
  'LA_SAVSEP',
  'LA_SAVPHA',
  'LA_SALKHO',
  'LA_SALTAO',
  'LA_SALLAK',
  'LA_SEDAK',
  'LA_SETHA',
  'LA_CHPAR',
  'LA_CHKHO',
  'LA_CHCHA',
  'LA_ATSAN1',
  'LA_ATPHO',
  'LA_ATXAY',
  'LA_ATSAN2',
  'LA_XAYTHA',
  'LA_XAYLON2',
];

exports.up = async function (db) {
  FACILITIES_TO_REMOVE.forEach(async facility => {
    await db.runSql(`
      DELETE FROM "clinic" WHERE "code"='${facility}';
      DELETE FROM "entity" WHERE "code"='${facility}';
    `);
  });

  await db.runSql(`
  UPDATE
    "mapOverlay"
  SET
    "countryCodes"='{CK,DL,FJ,KI,PG,PH,WS,SB,TL,TK,TO,VU,VE}'
  WHERE
    "id"='9';
  `);

  await db.runSql(`
  UPDATE
    "mapOverlay"
  SET
    "countryCodes"='{NR,NU,PW,TV,AS,GU,PF,NC,MP,PI,WF,CK,PG,DL,SB,TK,PH,VE,MH,WS,FM,KI,CI,TO,VU}'
  WHERE
    "id"='126';
  `);

  await db.runSql(`
  DELETE FROM
    "dashboardGroup"
  WHERE
    "name"='General'
  AND
    "organisationUnitCode"='LA';
  `);

  await db.runSql(`
  DELETE FROM
    "entity_relation"
  WHERE
    "parent_id"='5e9d06e261f76a30c400001a'
  AND
    "child_id"='5d3f884448c79c31bf5c4d50';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
