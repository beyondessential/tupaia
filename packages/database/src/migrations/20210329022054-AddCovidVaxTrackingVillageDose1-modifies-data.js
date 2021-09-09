'use strict';

import { insertObject, generateId, codeToId } from '../utilities';

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

const mapOverlay = {
  id: 'WS_COVID_TRACKING_Dose_1_Home_Village',
  name: 'Home village of people received 1st dose of COVID-19 vaccine',
  userGroup: 'COVID-19',
  dataElementCode: 'COVIDVac4',
  measureBuilderConfig: {
    entityAggregation: {
      dataSourceEntityType: 'village',
    },
  },
  measureBuilder: 'sumPerOrgUnit',
  presentationOptions: {
    scaleType: 'neutral',
    scaleColorScheme: 'default-reverse',
    displayType: 'spectrum',
    scaleBounds: {
      left: {
        min: 0,
        max: 0,
      },
    },
    measureLevel: 'Village',
    hideByDefault: {
      null: true,
    },
  },
  countryCodes: '{WS}',
  projectCodes: '{covid_samoa}',
};

exports.up = async function (db) {
  await insertObject(db, 'mapOverlay', mapOverlay);
  const mapOverLayGroupId = await codeToId(db, 'map_overlay_group', 'COVID19_Samoa');
  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverLayGroupId,
    child_id: mapOverlay.id,
    child_type: 'mapOverlay',
  });
};

exports.down = async function (db) {
  return db.runSql(`
    delete from "mapOverlay" where "id" = '${mapOverlay.id}';
    delete from "map_overlay_group_relation" where "child_id" = '${mapOverlay.id}';
  `);
};
