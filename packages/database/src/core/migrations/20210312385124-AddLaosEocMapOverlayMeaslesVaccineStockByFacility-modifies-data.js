'use strict';

import { arrayToDbString, insertObject, generateId } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

// Data elements
const dataSources = [
  // b3486q6rhgG 	mSupply SOH - (MR) Measles and Rubella Vaccine, Lyophilised, 10 doses/ vial
  {
    id: generateId(),
    code: 'SOH_85ea65e9',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'b3486q6rhgG', isDataRegional: false },
  },
  // oAGbFuZ53Ts 	mSupply SOH - (MR) Measles and Rubella Vaccine, Lyophilised, 5 doses/ vial
  {
    id: generateId(),
    code: 'SOH_f8cf15e9',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'oAGbFuZ53Ts', isDataRegional: false },
  },
];

const mapOverlayConfig = {
  id: 'LA_EOC_Measles_Vaccine_Stock_Facility',
  name: 'Measles Vaccine Stock Availability by Facility',
  userGroup: 'Laos EOC User',
  dataElementCode: 'value',
  isDataRegional: false,
  measureBuilder: 'checkMultiConditionsByOrgUnit',
  // linkedMeasures: '',
  measureBuilderConfig: {
    conditions: {
      '100%': {
        condition: {
          SOH_85ea65e9: {
            operator: '>',
            value: 0,
          },
          SOH_f8cf15e9: {
            operator: '>',
            value: 0,
          },
        },
      },
      Yes: {
        conditionType: 'OR',
        condition: {
          SOH_85ea65e9: 0,
          SOH_f8cf15e9: 0,
        },
      },
      No: {
        condition: {
          SOH_85ea65e9: 0,
          SOH_f8cf15e9: 0,
        },
      },
    },
    dataElementCodes: ['SOH_85ea65e9', 'SOH_f8cf15e9'],
    entityAggregation: {
      dataSourceEntityType: 'facility',
    },
  },
  presentationOptions: {
    values: [
      {
        name: 'Yes',
        color: 'green',
        value: 'Yes',
      },
      {
        name: 'No',
        color: 'red',
        value: 'No',
      },
      {
        name: '<100% in stock',
        color: 'orange',
        value: '100%',
      },
    ],
    displayType: 'color',
    measureLevel: 'facility',
    hideByDefault: {
      null: true,
    },
    // popupHeaderFormat: '{code}: {name}',
  },
  countryCodes: '{LA}',
  projectCodes: '{laos_eoc}',
};

const mapOverlayGroupCode = 'LAOS_EOC_Measles';

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await Promise.all(dataSources.map(dataSource => insertObject(db, 'data_source', dataSource)));
  await insertObject(db, 'mapOverlay', mapOverlayConfig);

  const mapOverlayGroupId = (
    await db.runSql(`select id from map_overlay_group where code = '${mapOverlayGroupCode}'`)
  ).rows[0].id;

  const mapOverlayGroupRelation = {
    id: generateId(),
    map_overlay_group_id: mapOverlayGroupId,
    child_id: mapOverlayConfig.id,
    child_type: 'mapOverlay',
  };

  await insertObject(db, 'map_overlay_group_relation', mapOverlayGroupRelation);
};

exports.down = function (db) {
  return db.runSql(`
    delete from "data_source" where code in (${arrayToDbString(dataSources.map(ds => ds.code))});
    
    delete from "map_overlay_group_relation" 
    where child_id = '${mapOverlayConfig.code}'
    and map_overlay_group_id in (select id from map_overlay_group where code = '${mapOverlayGroupCode}');

    delete from "mapOverlay" where id = '${mapOverlayConfig.id}';
  `);
};

exports._meta = {
  version: 1,
};
