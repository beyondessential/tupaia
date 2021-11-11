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
      dataElements: ['BH01_08'],
      dataGroups: ['BH01'],
      aggregations: [
        {
          type: 'RAW',
          config: {
            dataSourceEntityType: 'facility',
          },
        },
      ],
    },
    transform: [
      {
        transform: 'updateColumns',
        exclude: ['event', 'eventDate', 'orgUnitName', 'orgUnit', 'BH01_08'],
        insert: {
          organisationUnitCode: '=$orgUnit',
          '=$BH01_08': '= 1',
          value: '=$BH01_08',
        },
      },
      {
        transform: 'mergeRows',
        groupBy: ['organisationUnitCode'],
        using: {
          value: 'unique',
          '*': 'sum',
        },
      },
      {
        transform: 'insertColumns',
        columns: {
          Total: '=sum($Church, $Community, $Workplace, $School)',
        },
      },
    ],
  },
  permission_group: 'Behavioural Health',
};

const mapOverlayRecord = {
  id: generateId(),
  name: 'Activity Encounters by Setting Type',
  code: 'OLANGCH_Activity_Encounters_By_Setting',
  permission_group: 'Behavioural Health',
  data_services: [{ isDataRegional: true }],
  config: {
    displayType: 'color',
    valueType: 'text',
    measureLevel: 'Village',
    hideFromPopup: true,
    hideFromLegend: false,
    values: [
      {
        icon: 'circle',
        name: 'Church',
        color: 'darkblue',
        value: 'Church',
      },
      {
        icon: 'circle',
        name: 'School',
        color: 'orange',
        value: 'School',
      },
      {
        icon: 'circle',
        name: 'Workplace',
        color: 'pink',
        value: 'Workplace',
      },
      {
        icon: 'circle',
        name: 'Community',
        color: 'lightblue',
        value: 'Community',
      },
      {
        icon: 'circle',
        name: 'Multiple Settings',
        color: 'yellow',
        value: 'NO_UNIQUE_VALUE',
      },
      {
        icon: 'circle',
        name: 'No data',
        color: 'Grey',
        value: 'null',
      },
    ],
    measureConfig: {
      Church: {
        name: 'Church',
        sortOrder: 1,
        values: [
          {
            value: null,
            hideFromPopup: true,
          },
        ],
      },
      Community: {
        name: 'Community',
        sortOrder: 2,
        values: [
          {
            value: null,
            hideFromPopup: true,
          },
        ],
      },
      School: {
        name: 'School',
        sortOrder: 3,
        values: [
          {
            value: null,
            hideFromPopup: true,
          },
        ],
      },
      Workplace: {
        name: 'Workplace',
        sortOrder: 4,
        values: [
          {
            value: null,
            hideFromPopup: true,
          },
        ],
      },
      Total: {
        name: 'Total',
        sortOrder: 0,
      },
      $all: {
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
