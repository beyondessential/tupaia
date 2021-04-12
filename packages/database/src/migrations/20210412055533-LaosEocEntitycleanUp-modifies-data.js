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

exports.up = async function (db) {
  await db.runSql(`
    DELETE from entity
    where code = 'Gerard Kepa'
  `);

  // Trim entity code
  const entityCodes = [
    'WS_VPL438 ',
    'KH_Phnom Penh Municipality ',
    'TO_princessfusipala ',
    'NR_Yaren ',
    'NR_Anibare ',
    'FJ-14_HC_Sawakasa ',
  ];
  for (const entityCode of entityCodes) {
    const trimmedEntityCode = entityCode.trim();
    await db.runSql(`
      UPDATE entity 
      SET code = '${trimmedEntityCode}'
      where code = '${entityCode}';

      UPDATE clinic 
      SET code = '${trimmedEntityCode}'
      where code = '${entityCode}';
    `);
  }

  // Trim entity name
  const entityName = 'Phnom Penh Municipality ';
  await db.runSql(`
  UPDATE entity 
  SET name = '${entityName.trim()}'
  where name = '${entityName}';

  UPDATE clinic 
  SET name = '${entityName.trim()}'
  where name = '${entityName}';
`);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
