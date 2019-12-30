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

const MAP_OVERLAY_IDS = {
  lt5: 'CD_Measles_New_Cases_10kPax_Age_Lt_5',
  in5_24: 'CD_Measles_New_Cases_10kPax_Age_In_5_24',
  gte25: 'CD_Measles_New_Cases_10kPax_Age_Gte_25',
};

const createPopCodes = (startId, endId) => {
  const codes = [];
  for (let i = startId; i <= endId; i++) {
    codes.push(`POP${i.toString().padStart(2, '0')}`);
  }

  return codes;
};

const addNewCasesOverlay = (db, { id, ageCondition, ageLabel, startPopId, endPopId }) =>
  insertObject(db, 'mapOverlay', {
    id,
    name: `Age ${ageLabel} Measles Cases/10,000 pop`,
    groupName: 'Communicable Diseases',
    userGroup: 'Tonga Communicable Diseases',
    dataElementCode: 'value',
    displayType: 'spectrum',
    isDataRegional: false,
    values: [{ color: 'blue', value: 'other' }, { color: 'grey', value: null }],
    dataElementCode: 'value',
    measureBuilderConfig: {
      measureBuilders: {
        numerator: {
          measureBuilder: 'countEventsPerOrgUnit',
          measureBuilderConfig: {
            dataValues: { CD92: 'Measles', CD94: ageCondition },
            programCode: 'CD8',
          },
        },
        denominator: {
          measureBuilder: 'sumLatestPerOrgUnit',
          measureBuilderConfig: {
            dataSource: { type: 'single', codes: createPopCodes(startPopId, endPopId) },
          },
        },
      },
      fractionType: 'per10k',
      dataSourceType: 'custom',
    },
    measureBuilder: 'composePercentagePerOrgUnit',
    presentationOptions: {
      scaleType: 'performanceDesc',
      valueType: '2dp',
    },
    countryCodes: '{TO}',
  });

exports.up = async function(db) {
  await addNewCasesOverlay(db, {
    id: MAP_OVERLAY_IDS.lt5,
    ageCondition: { operator: '<', value: 5 },
    ageLabel: '<5',
    startPopId: 2,
    endPopId: 5,
  });
  await addNewCasesOverlay(db, {
    id: MAP_OVERLAY_IDS.in5_24,
    ageCondition: { operator: 'range', value: [5, 24] },
    ageLabel: '5-24',
    startPopId: 6,
    endPopId: 13,
  });
  return addNewCasesOverlay(db, {
    id: MAP_OVERLAY_IDS.gte25,
    ageCondition: { operator: '>=', value: 25 },
    ageLabel: '>24',
    startPopId: 14,
    endPopId: 37,
  });
};

exports.down = async function(db) {
  await db.runSql(`DELETE FROM "mapOverlay" WHERE id = '${MAP_OVERLAY_IDS.lt5}'`);
  await db.runSql(`DELETE FROM "mapOverlay" WHERE id = '${MAP_OVERLAY_IDS.in5_24}'`);
  return db.runSql(`DELETE FROM "mapOverlay" WHERE id = '${MAP_OVERLAY_IDS.gte25}'`);
};

exports._meta = {
  version: 1,
};
