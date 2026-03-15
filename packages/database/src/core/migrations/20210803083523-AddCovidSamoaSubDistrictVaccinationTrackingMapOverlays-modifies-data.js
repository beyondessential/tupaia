'use strict';

import { insertObject, generateId, codeToId, arrayToDbString } from '../utilities';

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

const DOSE1_MAP_OVERLAY = {
  id: 'WS_COVID_TRACKING_Dose_1_Home_Sub_District',
  name: 'Home district of people received 1st dose of COVID-19 vaccine',
  userGroup: 'COVID-19',
  dataElementCode: 'COVIDVac4',
  measureBuilderConfig: {
    aggregations: [
      {
        type: 'FINAL_EACH_DAY',
      },
    ],
    entityAggregation: {
      dataSourceEntityType: 'village',
      aggregationEntityType: 'sub_district',
    },
  },
  measureBuilder: 'sumAllPerOrgUnit',
  presentationOptions: {
    scaleType: 'neutral',
    scaleColorScheme: 'default-reverse',
    displayType: 'shaded-spectrum',
    scaleBounds: {
      left: {
        min: 0,
        max: 0,
      },
    },
    measureLevel: 'SubDistrict',
    hideByDefault: {
      null: true,
    },
  },
  countryCodes: '{WS}',
  projectCodes: '{covid_samoa}',
};

const DOSE2_MAP_OVERLAY = {
  id: 'WS_COVID_TRACKING_Dose_2_Home_Sub_District',
  name: 'Home district of people received 2nd dose of COVID-19 vaccine',
  userGroup: 'COVID-19',
  dataElementCode: 'COVIDVac8',
  measureBuilderConfig: {
    aggregations: [
      {
        type: 'FINAL_EACH_DAY',
      },
    ],
    entityAggregation: {
      dataSourceEntityType: 'village',
      aggregationEntityType: 'sub_district',
    },
  },
  measureBuilder: 'sumAllPerOrgUnit',
  presentationOptions: {
    scaleType: 'neutral',
    scaleColorScheme: 'default-reverse',
    displayType: 'shaded-spectrum',
    scaleBounds: {
      left: {
        min: 0,
        max: 0,
      },
    },
    measureLevel: 'SubDistrict',
    hideByDefault: {
      null: true,
    },
  },
  countryCodes: '{WS}',
  projectCodes: '{covid_samoa}',
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
          aggregationEntityType: 'sub_district',
        },
      },
    },
    denominator: {
      measureBuilder: 'sumLatestPerOrgUnit', // should take latest population
      measureBuilderConfig: {
        dataElementCodes: ['population_WS001'],
        aggregations: ['MOST_RECENT'],
        entityAggregation: {
          aggregationType: 'SUM_PER_ORG_GROUP',
          dataSourceEntityType: 'village',
          aggregationEntityType: 'sub_district',
        },
      },
    },
  },
});

const getPresentationOptions = () => ({
  scaleType: 'performance',
  valueType: 'percentage',
  displayType: 'shaded-spectrum',
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
  measureLevel: 'SubDistrict',
  hideByDefault: {
    null: true,
  },
  scaleColorScheme: 'performance',
});

const getPercentageMapOverlayConfig = ({ id, name, dataElementCode }) => ({
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

const PERCENTAGE_OVERLAYS = [
  {
    id: 'WS_COVID_TRACKING_Dose_1_Home_Sub_District_Percentage',
    name: '% of eligible population vaccinated 1st dose by district',
    dataElementCode: 'COVIDVac4',
  },
  {
    id: 'WS_COVID_TRACKING_Dose_2_Home_Sub_District_Percentage',
    name: '% of eligible population vaccinated 2nd dose by district',
    dataElementCode: 'COVIDVac8',
  },
];

exports.up = async function (db) {
  const mapOverLayGroupId = await codeToId(db, 'map_overlay_group', 'COVID19_Samoa');

  // Dose 1
  await insertObject(db, 'mapOverlay', DOSE1_MAP_OVERLAY);
  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverLayGroupId,
    child_id: DOSE1_MAP_OVERLAY.id,
    child_type: 'mapOverlay',
  });

  // Dose 2
  await insertObject(db, 'mapOverlay', DOSE2_MAP_OVERLAY);
  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverLayGroupId,
    child_id: DOSE2_MAP_OVERLAY.id,
    child_type: 'mapOverlay',
  });

  // % Dose 1
  await insertObject(db, 'mapOverlay', getPercentageMapOverlayConfig(PERCENTAGE_OVERLAYS[0]));
  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverLayGroupId,
    child_id: PERCENTAGE_OVERLAYS[0].id,
    child_type: 'mapOverlay',
  });

  // % Dose 2
  await insertObject(db, 'mapOverlay', getPercentageMapOverlayConfig(PERCENTAGE_OVERLAYS[1]));
  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverLayGroupId,
    child_id: PERCENTAGE_OVERLAYS[1].id,
    child_type: 'mapOverlay',
  });
};

exports.down = async function (db) {
  const overlayIds = [
    DOSE1_MAP_OVERLAY.id,
    DOSE2_MAP_OVERLAY.id,
    PERCENTAGE_OVERLAYS[0].id,
    PERCENTAGE_OVERLAYS[1].id,
  ];
  return db.runSql(`
    delete from "mapOverlay" where "id" IN (${arrayToDbString(overlayIds)});
    delete from "map_overlay_group_relation" where "child_id" IN (${arrayToDbString(overlayIds)});
  `);
};
