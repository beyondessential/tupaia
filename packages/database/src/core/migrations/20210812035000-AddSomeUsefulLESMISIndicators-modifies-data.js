'use strict';

import { generateId, insertObject, deleteObject } from '../utilities';

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

const sumSchoolCounts = (level, types) => {
  const dataElements = types.flatMap(x => [`nosch_type${x}_public`, `nosch_type${x}_private`]);

  return {
    id: generateId(),
    code: `nosch_${level}`,
    builder: 'analyticArithmetic',
    config: {
      aggregation: [
        'MOST_RECENT',
        {
          type: 'SUM_PER_ORG_GROUP',
          config: {
            dataSourceEntityType: 'sub_district',
            aggregationEntityType: 'requested',
          },
        },
      ],
      formula: `${dataElements.join(' + ')}`,
      defaultValues: Object.fromEntries(dataElements.map(x => [x, 0])),
    },
  };
};

const totalSchoolCount = {
  id: generateId(),
  code: 'nosch_total',
  builder: 'analyticArithmetic',
  config: {
    aggregation: 'MOST_RECENT',
    formula: 'nosch_ece + nosch_pe + nosch_se',
    defaultValues: {
      nosch_ece: 0,
      nosch_pe: 0,
      nosch_se: 0,
    },
  },
};

const SCHOOL_TYPES = [
  {
    level: 'ece',
    types: [1, 2, 3],
  },
  {
    level: 'pe',
    types: [4, 5],
  },
  {
    level: 'se',
    types: [6, 7, 8],
  },
];

exports.up = async function (db) {
  for (const { level, types } of SCHOOL_TYPES) {
    await insertObject(db, 'indicator', sumSchoolCounts(level, types));
  }
  await insertObject(db, 'indicator', totalSchoolCount);
};

exports.down = async function (db) {
  await deleteObject(db, 'indicator', { code: 'nosch_total' });
  for (const { level } of SCHOOL_TYPES) {
    await deleteObject(db, 'indicator', { code: `nosch_${level}` });
  }
};

exports._meta = {
  version: 1,
};
