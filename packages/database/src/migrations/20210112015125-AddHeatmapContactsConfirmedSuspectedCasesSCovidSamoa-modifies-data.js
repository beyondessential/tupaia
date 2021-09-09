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

async function deleteMapOverlay(db, mapOverlayId) {
  return db.runSql(`
    DELETE FROM
      "mapOverlay"
    WHERE
      "id" = '${mapOverlayId}';
  `);
}

async function deleteMapOverlayInMapOverlayGroupRelation(db, childId) {
  return db.runSql(`
    DELETE FROM
      "map_overlay_group_relation"
    WHERE
      "child_id" = '${childId}';
  `);
}

const mapOverlay = {
  id: 'COVID_WS_Address_Contacts_Of_Suspected_And_Confirmed_Cases',
  name: 'Home village of contacts of suspected/confirmed cases',
  userGroup: 'COVID-19 Senior',
  dataElementCode: 'value',
  measureBuilderConfig: {
    dataValues: {
      WS_CD_CT_Contact_12: '*',
    },
    programCode: 'SC1CT1V',
    dataSourceType: 'custom',
    entityAggregation: {
      aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
      dataSourceEntityType: 'individual',
      aggregationEntityType: 'village',
    },
  },
  measureBuilder: 'countEventsPerOrgUnit',
  presentationOptions: {
    scaleType: 'neutral',
    displayType: 'spectrum',
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
  await deleteMapOverlay(db, mapOverlay.id);
  await deleteMapOverlayInMapOverlayGroupRelation(db, mapOverlay.id);
};

exports._meta = {
  version: 1,
};
