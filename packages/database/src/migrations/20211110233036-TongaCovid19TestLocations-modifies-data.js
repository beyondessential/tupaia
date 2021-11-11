'use strict';

import { insertObject, generateId, findSingleRecord, findSingleRecordBySql } from '../utilities';

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

const reportCode = 'COVID_19_Tonga_Test_Locations_map';

const reportRecord = {
  id: generateId(),
  code: reportCode,
  config: {
    fetch: {
      dataGroups: ['LRF_TO'],
      aggregations: [
        {
          type: 'RAW',
          config: {
            dataSourceEntityType: 'village',
          },
        },
      ],
    },
    transform: [
      {
        transform: 'updateColumns',
        exclude: ['event', 'eventDate', 'orgUnitName', 'orgUnit'],
        insert: {
          organisationUnitCode: '=$orgUnit',
          value: 1,
        },
      },
      {
        transform: 'mergeRows',
        groupBy: 'organisationUnitCode',
        using: 'sum',
      },
    ],
  },
  permission_group: 'COVID-19 Senior',
};

const mapOverlayRecord = {
  id: generateId(),
  name: 'COVID-19 Test Locations',
  code: 'COVID_19_Tonga_Test_Locations',
  permission_group: 'COVID-19 Senior',
  data_services: [{ isDataRegional: false }],
  config: {
    displayType: 'color',
    scaleType: 'performanceDesc',
    measureLevel: 'Village',
    hideFromPopup: true,
    hideFromLegend: false,
    hideByDefault: { null: true },
    scaleBounds: {
      left: {
        max: 'auto',
      },
      right: {
        min: 'auto',
      },
    },
    measureConfig: {
      $all: {
        name: 'Total COVID-19 Swabs',
        type: 'popup-only',
      },
    },
  },
  country_codes: '{"PW"}',
  project_codes: '{olangch_palau}',
  report_code: reportCode,
};

exports.up = function (db) {
  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
