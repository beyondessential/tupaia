'use strict';

import { insertObject, arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const BASE_OVERLAY = {
  groupName: 'Flutracking Australia (LGA level)',
  userGroup: 'Public',
  dataElementCode: 'value',
  displayType: 'shaded-spectrum',
  isDataRegional: true,
  hideFromMenu: false,
  hideFromPopup: false,
  hideFromLegend: false,
  measureBuilder: 'composePercentagePerOrgUnit',
  countryCodes: '{"AU"}',
};

const BASE_PRESENTATION_OPTIONS = {
  valueType: 'percentage',
  scaleMin: 0,
};

const BASE_CONFIG = {
  fractionType: 'percentage',
  dataSourceType: 'custom',
  measureBuilders: {
    numerator: {
      measureBuilder: 'sumLatestPerOrgUnit',
      measureBuilderConfig: {
        dataElementCodes: [],
      },
    },
    denominator: {
      measureBuilder: 'sumLatestPerOrgUnit',
      measureBuilderConfig: {
        dataElementCodes: [],
      },
    },
  },
  aggregationEntityType: 'sub_district',
};

const OVERLAYS = [
  {
    id: 'AU_FLUTRACKING_LGA_Fever_And_Cough',
    name: '% of participants with fever and cough',
    dataElementCodes: ['FWV_LGA_004'],
    scaleMax: 0.035,
    denominatorCodes: ['FWV_LGA_003'],
    scaleType: 'performanceDesc',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Fever_And_Cough_Causing_Absence',
    name: '% of participants with fever and cough causing absence from normal activites',
    dataElementCodes: ['FWV_LGA_005'],
    scaleMax: 0.01,
    denominatorCodes: ['FWV_LGA_003'],
    scaleType: 'performanceDesc',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Vaccination_Rate_Flu',
    name: '% of participants vaccinated',
    dataElementCodes: ['FWV_LGA_006'],
    scaleMax: 1, // technically it would default to 1, but it is best to be clear here
    denominatorCodes: ['FWV_LGA_003'],
    scaleType: 'performance',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Vaccinated_With_Fever_And_Cough',
    name: '% of participants vaccinated with fever and cough',
    dataElementCodes: ['FWV_LGA_007'],
    scaleMax: 0.05,
    denominatorCodes: ['FWV_LGA_003'],
    scaleType: 'performanceDesc',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Sought_Medical_Advice',
    name: '% of participants who sought medical advice for fever and cough',
    dataElementCodes: ['FWV_LGA_008'],
    scaleMax: 0.05,
    denominatorCodes: ['FWV_LGA_003'],
    scaleType: 'performanceDesc',
  },

  // Below here have a different denominator
  {
    id: 'AU_FLUTRACKING_LGA_Tested_For_Flu',
    name: '% of participants with symptoms tested for flu',
    dataElementCodes: ['FWV_LGA_009'],
    scaleMax: 0.1,
    denominatorCodes: ['FWV_LGA_004'],
    scaleType: 'neutral',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Tested_For_Covid',
    name: '% of participants with symptoms tested for covid',
    dataElementCodes: ['FWV_LGA_010'],
    scaleMax: 1,
    denominatorCodes: ['FWV_LGA_004'],
    scaleType: 'performance',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Tested_Positive_For_Flu',
    name: '% of participants with symptoms tested positive for flu',
    dataElementCodes: ['FWV_LGA_011'],
    scaleMax: 0.05,
    denominatorCodes: ['FWV_LGA_004'],
    scaleType: 'performanceDesc',
  },
  {
    id: 'AU_FLUTRACKING_LGA_Tested_Positive_For_Covid',
    name: '% of participants with symptoms tested positive for covid',
    dataElementCodes: ['FWV_LGA_012'],
    scaleMax: 0.05,
    denominatorCodes: ['FWV_LGA_004'],
    scaleType: 'performanceDesc',
  },
];

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await Promise.all(
    OVERLAYS.map((overlay, index) => {
      const { name, id, scaleMax, dataElementCodes, scaleType, denominatorCodes } = overlay;
      BASE_CONFIG.measureBuilders.numerator.measureBuilderConfig.dataElementCodes = dataElementCodes;
      BASE_CONFIG.measureBuilders.denominator.measureBuilderConfig.dataElementCodes = denominatorCodes;

      return insertObject(db, 'mapOverlay', {
        ...BASE_OVERLAY,
        name,
        id,
        presentationOptions: { ...BASE_PRESENTATION_OPTIONS, scaleMax, scaleType },
        measureBuilderConfig: { ...BASE_CONFIG },
        sortOrder: index + 2, // We want the total participants to be first
      });
    }),
  );
};

exports.down = function (db) {
  return db.runSql(
    `	
    DELETE FROM "mapOverlay" WHERE "id" in (${arrayToDbString(OVERLAYS.map(o => o.id))});	
  `,
  );
};

exports._meta = {
  version: 1,
};
