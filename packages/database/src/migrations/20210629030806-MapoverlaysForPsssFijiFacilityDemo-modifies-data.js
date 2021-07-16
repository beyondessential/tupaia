'use strict';

import { insertObject, generateId } from '../utilities';

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

const syndromes = [
  {
    dataElement: 'PSSS_AFR_Cases',
    name: 'AFR',
    customLabel: 'AFR Case Numbers',
  },
  {
    dataElement: 'PSSS_PF_Cases',
    name: 'PF',
    customLabel: 'PF Case Numbers',
  },
  {
    dataElement: 'PSSS_ILI_Cases',
    name: 'ILI',
    customLabel: 'ILI Case Numbers',
  },
  {
    dataElement: 'PSSS_DLI_Cases',
    name: 'DLI',
    customLabel: 'DLI Case Numbers',
  },
  {
    dataElement: 'PSSS_DIA_Cases',
    name: 'Diarrhoea',
    code: 'DIA',
    customLabel: 'Diarrhoea Case Numbers',
  },
];

const syndromeBaseMapOverlay = {
  userGroup: 'PSSS Tupaia',
  isDataRegional: true,
  dataElementCode: 'value',
  measureBuilder: 'sumLatestPerOrgUnit',
  countryCodes: '{"FJ"}',
  projectCodes: '{"psss"}',
};

const syndromeRadiusMapOverlay = (syndromeName, dateElement, syndromeCode, customLabel) => ({
  ...syndromeBaseMapOverlay,
  id: `PSSS_FJ_${syndromeCode}_Syndrome_Bubble_Radius_Weekly`,
  name: syndromeName,
  measureBuilderConfig: {
    dataElementCodes: [dateElement],
    entityAggregation: {
      dataSourceEntityType: 'facility',
    },
  },
  presentationOptions: {
    values: [{ color: 'blue', value: 'other' }],
    displayType: 'radius',
    measureLevel: 'Facility',
    defaultTimePeriod: {
      unit: 'week',
      offset: 0,
    },
    periodGranularity: 'one_week_at_a_time',
    customLabel,
    hideByDefault: {
      null: true,
    },
  },
});

const syndromeHeatMapOverlay = (syndromeName, dateElement, syndromeCode, customLabel) => ({
  ...syndromeBaseMapOverlay,
  id: `PSSS_FJ_${syndromeCode}_Syndrome_Heat_Map_Weekly`,
  name: syndromeName,
  measureBuilderConfig: {
    dataElementCodes: [dateElement],
    entityAggregation: {
      dataSourceEntityType: 'facility',
    },
  },
  presentationOptions: {
    values: [
      {
        color: 'grey',
        value: null,
      },
    ],
    scaleType: 'performanceDesc',
    displayType: 'shaded-spectrum',
    measureLevel: 'Facility',
    defaultTimePeriod: {
      unit: 'week',
      offset: 0,
    },
    hideByDefault: { null: true },
    periodGranularity: 'one_week_at_a_time',
    customLabel,
  },
});

const radiusMapOverlayGroup = {
  id: generateId(),
  name: 'Syndromic Surveillance Weekly Case Numbers (Radius map)',
  code: 'FJ_PSSS_Syndromic_Surveillance_Radius_Map_Country',
};
const heatMapOverlayGroup = {
  id: generateId(),
  name: 'Syndromic Surveillance Weekly Case Numbers (Heat map)',
  code: 'FJ_PSSS_Syndromic_Surveillance_Heat_Map_Country',
};

exports.up = async function (db) {
  for (const mapOverlayGroup of [radiusMapOverlayGroup, heatMapOverlayGroup]) {
    await insertObject(db, 'map_overlay_group', mapOverlayGroup);
    await insertObject(db, 'map_overlay_group_relation', {
      id: generateId(),
      map_overlay_group_id: '5f88d3a361f76a2d3f000004', // Root
      child_id: mapOverlayGroup.id,
      child_type: 'mapOverlayGroup',
    });
  }
  for (const [index, { name, dataElement, code, customLabel }] of syndromes.entries()) {
    const radiusMapOverlay = syndromeRadiusMapOverlay(name, dataElement, code ?? name, customLabel);
    const heatMapOverlay = syndromeHeatMapOverlay(name, dataElement, code ?? name, customLabel);

    for (const [mapOverlay, mapOverlayGroup] of [
      [radiusMapOverlay, radiusMapOverlayGroup],
      [heatMapOverlay, heatMapOverlayGroup],
    ]) {
      await insertObject(db, 'mapOverlay', mapOverlay);
      await insertObject(db, 'map_overlay_group_relation', {
        id: generateId(),
        map_overlay_group_id: mapOverlayGroup.id,
        child_id: mapOverlay.id,
        child_type: 'mapOverlay',
        sort_order: index,
      });
    }
  }
};

exports.down = async function (db) {
  await db.runSql(
    `
      DELETE FROM "map_overlay_group_relation" r
      USING "map_overlay_group" g 
      WHERE g.id = r.map_overlay_group_id
      AND g.code in ('${radiusMapOverlayGroup.code}','${heatMapOverlayGroup.code}');
      DELETE FROM "map_overlay_group"
      WHERE code in ('${radiusMapOverlayGroup.code}','${heatMapOverlayGroup.code}');
    `,
  );

  for (const { name, dataElement, code, customLabel } of syndromes) {
    const radiusMapOverlay = syndromeRadiusMapOverlay(name, dataElement, code ?? name, customLabel);
    const heatMapOverlay = syndromeHeatMapOverlay(name, dataElement, code ?? name, customLabel);
    for (const mapOverlay of [radiusMapOverlay, heatMapOverlay]) {
      await db.runSql(
        `
          DELETE FROM "mapOverlay"
          WHERE id in ('${mapOverlay.id}');
        `,
      );
    }
  }
};

exports._meta = {
  version: 1,
};
