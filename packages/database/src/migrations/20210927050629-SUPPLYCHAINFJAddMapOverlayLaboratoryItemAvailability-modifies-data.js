'use strict';

var dbm;
var type;
var seed;

import {
  insertObject,
  generateId,
  findSingleRecord,
  findSingleRecordBySql,
  deleteObject,
} from '../utilities';

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const PERMISSION_GROUP = 'Fiji Supply Chain';

const DATA_ELEMENTS = [
  {
    element: 'FijiBCS22',
    name: 'Buffer Pack'
  },
  {
    element: 'FijiBCS23',
    name: 'Wash and CD Pack 348'
  },
  {
    element: 'FijiBCS24',
    name: 'Cellpack DCL 20L'
  },
  {
    element: 'FijiBCS25',
    name: 'Aerobic Blood Culture Bottles BacT/Alert - FA'
  },
  {
    element: 'FijiBCS26',
    name: 'Anaerobic Blood Culture Bottles BacT/Alert - SN'
  },
  {
    element: 'FijiBCS27',
    name: 'Anti-A monoclonal reagent 10ml vial'
  },
  {
    element: 'FijiBCS28',
    name: 'Anti-B monoclonal reagent 10ml vial'
  },{
    element: 'FijiBCS29',
    name: 'Anti-D duoclone IgM IgG blend 10ml vial'
  },
  {
    element: 'FijiBCS30',
    name: 'BD Sodium Citrate tubes (1.8ml) (1 x 100)'
  },{
    element: 'FijiBCS31',
    name: 'Container 70ml sterile screw to pp labelled pink cap (Sputum Bottle)'
  },
  {
    element: 'FijiBCS32',
    name: 'Container Sterile Urine 70ml Screw to pp labeled Yellow cap, Technoplas 500/box'
  },{
    element: 'FijiBCS33',
    name: 'Determine HepBsAntigen SP 100T'
  },
  {
    element: 'FijiBCS34',
    name: 'Determine HIV 1/2 SP 100T'
  },{
    element: 'FijiBCS35',
    name: 'Diluent 20L - BC 3000 Analyser'
  },
  {
    element: 'FijiBCS36',
    name: 'DT7D2543-Determine Syphilis SP 100T'
  },
  {
    element: 'FijiBCS37',
    name: 'Elite polyspecific Anti-human globulin blended rabbit monoclonal antihuman globulin 10ml'
  },
  {
    element: 'FijiBCS38',
    name: 'Greiner Vacuette K2E EDTA K2 Anticoagulant Tubes 13x75mm (rack of  100s)'
  },
  {
    element: 'FijiBCS39',
    name: 'HbA1c: BS-800M1 Reagents'
  },
  {
    element: 'FijiBCS40',
    name: 'Lamp 801-BA-80-00001-00'
  },
  {
    element: 'FijiBCS41',
    name: 'Liss ready for use 2500ml bottle'
  },
  {
    element: 'FijiBCS42',
    name: 'Macro-Vue RPR card test #104 300/test'
  },
  {
    element: 'FijiBCS43',
    name: 'Microbact 12 A (Identification Kits, Box of 120tests)'
  },
  {
    element: 'FijiBCS44',
    name: 'Microbact 12 B (Identification Kits 120tests/box)'
  },
  {
    element: 'FijiBCS45',
    name: 'MP9B8004030-Leptospira IgM Dip S-25T'
  },
  {
    element: 'FijiBCS46',
    name: 'MPBR70700-Dengue NSI Antigen Strip 25/pkt'
  },
  {
    element: 'FijiBCS47',
    name: 'Paediatric Blood Culture Bottles BacT/Alert - PF Bottle'
  },
  {
    element: 'FijiBCS48',
    name: 'Reagent Module(Cal A, Cal B, Waste) ISE Module - BS 200 Reagents'
  },
]

const overlayGroupRecord = {
  id: generateId(),
  name: 'Laboratory Item Availability',
  code: 'FIJI_SUPPLY_CHAIN_Laboratory_Item_Availability',
}

const createReport = (reportCode, dataElements) => ({
  code: reportCode,
  config: {
    fetch: {
      dataElements,
      aggregations: [
        {
          type: 'MOST_RECENT',
          config: {
            dataSourceEntityType: 'facility',
          },
        },
      ],
    },
    transform: [
      {
        transform: 'updateColumns',
        insert: {
          organisationUnitCode: '=$organisationUnit',
        },
        exclude: ['organisationUnit', 'dataElement', 'period'],
      },
    ],
  },
});

const createMapOverlay = (name, reportCode) => ({
  id: reportCode,
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
    displayType: 'color',
    valueType: 'text',
    measureLevel: 'Facility',
    hideFromPopup: false,
    hideFromLegend: false,
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
        name: 'Yes but Expired',
        color: 'blue',
        value: 'Yes but Expired',
      },
    ],
  },
  countryCodes: '{"FJ"}',
  projectCodes: '{supplychain_fiji}',

  legacy: false,
  report_code: reportCode,
});

exports.up = function(db) {
  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
