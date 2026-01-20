'use strict';

import { insertObject } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const BASE_OVERLAY = {
  groupName: '% mRDT Positive by Result: Health Facility Data (Source: CRF)',
  userGroup: 'STRIVE User',
  dataElementCode: 'value',
  displayType: 'spectrum',
  isDataRegional: true,
  hideFromMenu: false,
  hideFromPopup: false,
  hideFromLegend: false,
  values: [
    // Shows icon only if there is no data.
    {
      icon: 'hidden',
      color: 'blue',
      value: 'other',
    },
    {
      icon: 'fade',
      color: 'grey',
      value: null,
    },
  ],
  measureBuilder: 'composePercentagePerOrgUnit',
  countryCodes: '{"PG"}',
  presentationOptions: {
    scaleType: 'performanceDesc',
    valueType: 'percentage',
    scaleMax: 'auto',
  },
  linkedMeasures: '{"STRIVE_CRF_mRDT_Tests_Radius"}',
};

const BASE_CONFIG = {
  measureBuilders: {
    numerator: {
      measureBuilder: 'countEventsPerOrgUnit',
      measureBuilderConfig: {
        dataValues: {
          STR_CRF169: 'SHOULD_BE_OVERWRITTEN',
        },
        programCode: 'SCRF',
        dataSourceEntityType: 'village',
        aggregationEntityType: 'facility',
      },
    },
    denominator: {
      measureBuilder: 'countEventsPerOrgUnit',
      measureBuilderConfig: {
        dataValues: {
          STR_CRF165: 1,
        },
        programCode: 'SCRF',
        dataSourceEntityType: 'village',
        aggregationEntityType: 'facility',
      },
    },
  },
  dataSourceType: 'custom',
  aggregationEntityType: 'facility',
};

const OVERLAY_1 = {
  id: 'STRIVE_CRF_Positive_Pf_Percentage',
  name: 'Positive Pf',
  value: 'Positive Pf',
};

const OVERLAY_2 = {
  id: 'STRIVE_CRF_Positive_Mixed_Percentage',
  name: 'Positive Mixed',
  value: 'Positive Mixed',
};

const OVERLAY_3 = {
  id: 'STRIVE_CRF_Positive_Non_Pf_Percentage',
  name: 'Positive Non-Pf',
  value: 'Positive Non-Pf',
};

const OVERLAY_4 = {
  id: 'STRIVE_CRF_Positive',
  name: '% mRDT Positive (of total # tests performed)',
  groupName: 'STRIVE PNG: Health Facility Data (Source: CRF)',
  value: {
    value: 'Positive',
    operator: 'regex',
  },
};

const OVERLAYS = [OVERLAY_1, OVERLAY_2, OVERLAY_3, OVERLAY_4];

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await Promise.all(
    OVERLAYS.map(({ value, ...overlay }) => {
      const newOverlay = { ...BASE_OVERLAY, ...overlay };
      newOverlay.measureBuilderConfig = { ...BASE_CONFIG };
      newOverlay.measureBuilderConfig.measureBuilders.numerator.measureBuilderConfig.dataValues.STR_CRF169 = value;
      return insertObject(db, 'mapOverlay', newOverlay);
    }),
  );
};

exports.down = async function (db) {
  await db.runSql(
    `	
    DELETE FROM "mapOverlay" WHERE "id" = '${OVERLAY_1.id}';	
    DELETE FROM "mapOverlay" WHERE "id" = '${OVERLAY_2.id}';	
    DELETE FROM "mapOverlay" WHERE "id" = '${OVERLAY_3.id}';	
    DELETE FROM "mapOverlay" WHERE "id" = '${OVERLAY_4.id}';	
  `,
  );
};

exports._meta = {
  version: 1,
};
