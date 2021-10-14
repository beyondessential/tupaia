'use strict';

import { generateId, insertObject, codeToId, nameToId, arrayToDbString } from '../utilities';

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

const getReport = (reportCode, dataElements) => {
  const aggregations = [
    {
      type: 'FINAL_EACH_DAY',
      config: {
        dataSourceEntityType: 'village',
      },
    },
  ];

  const subDistrictAggregationConfig = {
    type: 'SUM_PER_ORG_GROUP',
    config: {
      dataSourceEntityType: 'village',
      aggregationEntityType: 'sub_district',
    },
  };

  const villageAggregationConfig = {
    type: 'SUM',
  };

  if (reportCode.includes('Sub_District')) {
    aggregations.push(subDistrictAggregationConfig);
  } else if (reportCode.includes('Village')) {
    aggregations.push(villageAggregationConfig);
  }

  return {
    code: reportCode,
    config: {
      fetch: {
        dataElements,
        aggregations,
      },
      transform: [
        'keyValueByDataElementName',
        {
          transform: 'mergeRows',
          groupBy: 'organisationUnit',
          using: {
            period: 'exclude',
          },
        },
        {
          where: `=(not exists($${dataElements[0]})) or (not exists($most_recent_WS_population))`,
          transform: 'excludeRows',
        },
        {
          insert: {
            value: `=min($${dataElements[0]} / $most_recent_WS_population,1)`,
            organisationUnitCode: '=$organisationUnit',
          },
          exclude: '*',
          transform: 'updateColumns',
        },
      ],
    },
  };
};

const PERMISSION_GROUP = 'COVID-19';

const getMapOverlay = (name, reportCode) => ({
  id: reportCode,
  report_code: reportCode,
  legacy: false,
  name,
  userGroup: PERMISSION_GROUP,
  dataElementCode: 'value',
  isDataRegional: true,
  measureBuilder: 'useReportServer',
  measureBuilderConfig: {
    dataSourceType: 'custom',
    reportCode,
  },
  presentationOptions: {
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
    measureLevel: reportCode.includes('Sub_District') ? 'SubDistrict' : 'Village',
  },
  countryCodes: '{"WS"}',
  projectCodes: '{covid_samoa}',
});

const addMapOverlay = async (db, parentCode, config) => {
  const { reportCode, dataElements, name, sortOrder } = config;
  const report = getReport(reportCode, dataElements);
  const mapOverlay = getMapOverlay(name, reportCode);
  const permissionGroupId = await nameToId(db, 'permission_group', PERMISSION_GROUP);
  await insertObject(db, 'report', {
    id: generateId(),
    permission_group_id: permissionGroupId,
    ...report,
  });
  await insertObject(db, 'mapOverlay', mapOverlay);

  const mapOverlayGroupId = await codeToId(db, 'map_overlay_group', parentCode);
  return insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverlayGroupId,
    child_id: mapOverlay.id,
    child_type: 'mapOverlay',
    sort_order: sortOrder,
  });
};

const MAP_OVERLAYS = [
  {
    parentCode: `COVID19_Samoa`,
    children: [
      {
        reportCode: 'WS_COVID_TRACKING_Dose_1_Home_Sub_District_Percentage_Capped',
        outdatedOverlayId: 'WS_COVID_TRACKING_Dose_1_Home_Sub_District_Percentage',
        name: '% of Eligible Population Vaccinated COVID-19 Dose 1 (District)',
        dataElements: ['COVIDVac4', 'most_recent_WS_population'],
        sortOrder: 0,
      },
      {
        reportCode: `WS_COVID_TRACKING_Dose_2_Home_Sub_District_Percentage_Capped`,
        outdatedOverlayId: 'WS_COVID_TRACKING_Dose_2_Home_Sub_District_Percentage',
        name: '% of Eligible Population Vaccinated COVID-19 Dose 2 (District)',
        dataElements: ['COVIDVac8', 'most_recent_WS_population'],
        sortOrder: 2,
      },
      {
        reportCode: `WS_COVID_TRACKING_Dose_1_Home_Village_Percentage_Capped`,
        outdatedOverlayId: 'WS_COVID_TRACKING_Dose_1_Home_Village_Percentage',
        name: '% of Eligible Population Vaccinated COVID-19 Dose 1 (Village)',
        dataElements: ['COVIDVac4', 'most_recent_WS_population'],
        sortOrder: 1,
      },
      {
        reportCode: `WS_COVID_TRACKING_Dose_2_Home_Village_Percentage_Capped`,
        outdatedOverlayId: 'WS_COVID_TRACKING_Dose_2_Home_Village_Percentage',
        name: '% of Eligible Population Vaccinated COVID-19 Dose 2 (Village)',
        dataElements: ['COVIDVac8', 'most_recent_WS_population'],
        sortOrder: 3,
      },
    ],
  },
];

const removeOutdatedMapOverlay = (db, outdatedOverlayId) => {
  return db.runSql(`
    DELETE FROM "mapOverlay" WHERE "id" = '${outdatedOverlayId}';
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${outdatedOverlayId}';
  `);
};

const removeMapOverlay = (db, reportCode) => {
  return db.runSql(`
    DELETE FROM "report" WHERE code = '${reportCode}';
    DELETE FROM "mapOverlay" WHERE "id" = '${reportCode}';
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${reportCode}';
  `);
};

exports.up = async function (db) {
  // Add Map Overlays
  for (const { parentCode, children } of MAP_OVERLAYS) {
    for (const config of children) {
      await addMapOverlay(db, parentCode, config);
    }
  }

  // Remove Outdated Map Overlays
  for (const { children } of MAP_OVERLAYS) {
    for (const { outdatedOverlayId } of children) {
      await removeOutdatedMapOverlay(db, outdatedOverlayId);
    }
  }
};

exports.down = async function (db) {
  // Remove Map Overlays
  for (const { children } of MAP_OVERLAYS) {
    for (const { reportCode } of children) {
      await removeMapOverlay(db, reportCode);
    }
  }
};

exports._meta = {
  version: 1,
};
