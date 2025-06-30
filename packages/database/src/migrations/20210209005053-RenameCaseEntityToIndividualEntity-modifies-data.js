'use strict';

import { arrayToDbString, removeArrayValue } from '../utilities/migration';

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
const ENTITY_HIERARCHY = 'entity_hierarchy';
const CANONICAL_TYPES = 'canonical_types';
const COVID_SAMOA = 'covid_samoa';
const CASE = 'case';
const INDIVIDUAL = 'individual';
const surveyCodes = ['SC1QMFUA', 'SC1QMIA'];
const changeEntityType = async (db, currentEntityType, newEntityType) => {
  await db.runSql(`
  UPDATE entity 
  SET type = '${newEntityType}'
  WHERE id in (SELECT sr.entity_id
               FROM survey_response sr 
               JOIN survey s2 
               ON s2.id = sr.survey_id 
               JOIN entity e2 on e2.id = sr.entity_id 
               WHERE s2.code in (${arrayToDbString(surveyCodes)})
               AND e2.country_code = 'WS'  
               AND e2."type" = '${currentEntityType}'
               )
  `);
};
async function appendArrayValue(db, table, column, value, condition) {
  await db.runSql(
    `UPDATE "${table}" 
     SET "${column}" = ${column} || '{${value}}' 
     WHERE ${condition}`,
  );
}

exports.up = async function (db) {
  await changeEntityType(db, CASE, INDIVIDUAL);
  await appendArrayValue(
    db,
    ENTITY_HIERARCHY,
    CANONICAL_TYPES,
    INDIVIDUAL,
    `name = '${COVID_SAMOA}'`,
  );
};

exports.down = async function (db) {
  await removeArrayValue(
    db,
    ENTITY_HIERARCHY,
    CANONICAL_TYPES,
    INDIVIDUAL,
    `name = '${COVID_SAMOA}'`,
  );
  await changeEntityType(db, INDIVIDUAL, CASE);
};

exports._meta = {
  version: 1,
};
