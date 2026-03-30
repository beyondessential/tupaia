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

const indicator = {
  id: generateId(),
  code: 'COVID_SAMOA_Confirmed_Cases',
  builder: 'eventCheckConditions',
  config: {
    formula:
      "WS_COVID19_Clinsurv_137 == 1 or equalText(WS_COVID19_Clinsurv_75, '1. Positive') or equalText(WS_COVID19_Clinsurv_79, '1. Positive') or equalText(WS_COVID19_Clinsurv_83, '1. IgG positive only') or equalText(WS_COVID19_Clinsurv_83, '2. IgM positive only') or equalText(WS_COVID19_Clinsurv_83, '3. IgM / IgG positive') or equalText(WS_COVID19_Clinsurv_87, '1. Positive')",
    programCode: 'SC1CS',
    defaultValues: {
      WS_COVID19_Clinsurv_137: 0,
      WS_COVID19_Clinsurv_75: 'undefined',
      WS_COVID19_Clinsurv_79: 'undefined',
      WS_COVID19_Clinsurv_83: 'undefined',
      WS_COVID19_Clinsurv_87: 'undefined',
    },
  },
};
const mapOverlay = {
  id: 'COVID_WS_Home_Village_Of_Confirmed_Cases',
  name: 'Home village of confirmed cases',
  userGroup: 'COVID-19 Senior',
  dataElementCode: indicator.code,
  measureBuilderConfig: {
    entityAggregation: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'village',
    },
  },
  measureBuilder: 'sumAllPerOrgUnit',
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

  const mapOverlayGroupId = await codeToId(db, 'map_overlay_group', 'COVID19_Samoa');
  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverlayGroupId,
    child_id: mapOverlay.id,
    child_type: 'mapOverlay',
  });

  await insertObject(db, 'indicator', indicator);

  await insertObject(db, 'data_source', {
    id: generateId(),
    code: indicator.code,
    type: 'dataElement',
    service_type: 'indicator',
  });
};

const deleteItemByOneCondition = async (db, table, condition) => {
  const [key, value] = Object.entries(condition)[0];
  return db.runSql(`
    DELETE FROM
      "${table}"
    WHERE
      "${key}" = '${value}';
  `);
};

exports.down = async function (db) {
  await deleteItemByOneCondition(db, 'mapOverlay', { id: mapOverlay.id });
  await deleteItemByOneCondition(db, 'map_overlay_group_relation', { child_id: mapOverlay.id });
  await deleteItemByOneCondition(db, 'indicator', { code: indicator.code });
  await deleteItemByOneCondition(db, 'data_source', { code: indicator.code });
};

exports._meta = {
  version: 1,
};
