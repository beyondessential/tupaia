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

const getMeasureBuilderConfig = dataElementCode => ({
  dataSourceType: 'custom',
  measureBuilders: {
    numerator: {
      measureBuilder: 'sumAllPerOrgUnit',
      measureBuilderConfig: {
        aggregations: [
          {
            type: 'FINAL_EACH_DAY',
          },
        ],
        dataElementCodes: [dataElementCode],
        entityAggregation: {
          dataSourceEntityType: 'village',
        },
      },
    },
    denominator: {
      measureBuilder: 'sumLatestPerOrgUnit', // should take latest population
      measureBuilderConfig: {
        dataElementCodes: ['population_WS001'],
        entityAggregation: {
          dataSourceEntityType: 'village',
        },
      },
    },
  },
});

const getPresentationOptions = () => ({
  scaleType: 'performance',
  valueType: 'percentage',
  displayType: 'spectrum',
  scaleBounds: {
    left: {
      max: 0,
      min: 0,
    },
    right: {
      max: 1,
      min: 1,
    },
  },
  measureLevel: 'Village',
  hideByDefault: {
    null: true,
  },
  scaleColorScheme: 'performance',
});

const getMeasure = ({ id, name, dataElementCode }) => ({
  id,
  name,
  dataElementCode: 'value',
  measureBuilder: 'composePercentagePerOrgUnit',
  measureBuilderConfig: getMeasureBuilderConfig(dataElementCode),
  presentationOptions: getPresentationOptions(),
  userGroup: 'COVID-19',
  countryCodes: '{WS}',
  projectCodes: '{covid_samoa}',
});

const MEASURES = [
  {
    id: 'WS_COVID_TRACKING_Dose_1_Home_Village_Percentage',
    name: '% of eligible population vaccinated 1st dose by village',
    dataElementCode: 'COVIDVac4',
  },
  {
    id: 'WS_COVID_TRACKING_Dose_2_Home_Village_Percentage',
    name: '% of eligible population vaccinated 2nd dose by Village',
    dataElementCode: 'COVIDVac8',
  },
];

exports.up = async function (db) {
  const mapOverLayGroupId = await codeToId(db, 'map_overlay_group', 'COVID19_Samoa');

  // Overlay 1
  await insertObject(db, 'mapOverlay', getMeasure(MEASURES[0]));
  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverLayGroupId,
    child_id: MEASURES[0].id,
    child_type: 'mapOverlay',
  });

  // Overlay 2
  await insertObject(db, 'mapOverlay', getMeasure(MEASURES[1]));
  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverLayGroupId,
    child_id: MEASURES[1].id,
    child_type: 'mapOverlay',
  });
};

exports.down = async function (db) {
  return db.runSql(`
    delete from "mapOverlay" where "id" = '${MEASURES[0].id}';
    delete from "map_overlay_group_relation" where "child_id" = '${MEASURES[0].id}';

    delete from "mapOverlay" where "id" = '${MEASURES[1].id}';
    delete from "map_overlay_group_relation" where "child_id" = '${MEASURES[1].id}';
  `);
};

exports._meta = {
  version: 1,
};
