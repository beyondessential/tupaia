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
    description: 'Buffer Pack'
  },
  {
    element: 'FijiBCS23',
    description: 'Wash and CD Pack 348'
  },
  {
    element: 'FijiBCS24',
    description: 'Cellpack DCL 20L'
  },
  {
    element: 'FijiBCS25',
    description: 'Aerobic Blood Culture Bottles BacT/Alert - FA'
  },
  {
    element: 'FijiBCS26',
    description: 'Anaerobic Blood Culture Bottles BacT/Alert - SN'
  },
  {
    element: 'FijiBCS27',
    description: 'Anti-A monoclonal reagent 10ml vial'
  },
  {
    element: 'FijiBCS28',
    description: 'Anti-B monoclonal reagent 10ml vial'
  },{
    element: 'FijiBCS29',
    description: 'Anti-D duoclone IgM IgG blend 10ml vial'
  },
  {
    element: 'FijiBCS30',
    description: 'BD Sodium Citrate tubes (1.8ml) (1 x 100)'
  },{
    element: 'FijiBCS31',
    description: 'Container 70ml sterile screw to pp labelled pink cap (Sputum Bottle)'
  },
  {
    element: 'FijiBCS32',
    description: 'Container Sterile Urine 70ml Screw to pp labeled Yellow cap, Technoplas 500/box'
  },{
    element: 'FijiBCS33',
    description: 'Determine HepBsAntigen SP 100T'
  },
  {
    element: 'FijiBCS34',
    description: 'Determine HIV 1/2 SP 100T'
  },{
    element: 'FijiBCS35',
    description: 'Diluent 20L - BC 3000 Analyser'
  },
  {
    element: 'FijiBCS36',
    description: 'DT7D2543-Determine Syphilis SP 100T'
  },
  {
    element: 'FijiBCS37',
    description: 'Elite polyspecific Anti-human globulin blended rabbit monoclonal antihuman globulin 10ml'
  },
  {
    element: 'FijiBCS38',
    description: 'Greiner Vacuette K2E EDTA K2 Anticoagulant Tubes 13x75mm (rack of  100s)'
  },
  {
    element: 'FijiBCS39',
    description: 'HbA1c: BS-800M1 Reagents'
  },
  {
    element: 'FijiBCS40',
    description: 'Lamp 801-BA-80-00001-00'
  },
  {
    element: 'FijiBCS41',
    description: 'Liss ready for use 2500ml bottle'
  },
  {
    element: 'FijiBCS42',
    description: 'Macro-Vue RPR card test #104 300/test'
  },
  {
    element: 'FijiBCS43',
    description: 'Microbact 12 A (Identification Kits, Box of 120tests)'
  },
  {
    element: 'FijiBCS44',
    description: 'Microbact 12 B (Identification Kits 120tests/box)'
  },
  {
    element: 'FijiBCS45',
    description: 'MP9B8004030-Leptospira IgM Dip S-25T'
  },
  {
    element: 'FijiBCS46',
    description: 'MPBR70700-Dengue NSI Antigen Strip 25/pkt'
  },
  {
    element: 'FijiBCS47',
    description: 'Paediatric Blood Culture Bottles BacT/Alert - PF Bottle'
  },
  {
    element: 'FijiBCS48',
    description: 'Reagent Module(Cal A, Cal B, Waste) ISE Module - BS 200 Reagents'
  },
]

const createReport = 

const createOverlay = [

]

const overlayGroupRecord = {
  id: generateId(),
  name: 'Laboratory Item Availability',
  code: 'FJ_SUPPLY_CHAIN_Laboratory_Item_Availability',
}

const getReport = (reportCode, dataElements) => ({
  code: reportCode,
  config: {
    fetch: {
      dataElements,
      aggregations: [
        {
          type: 'FINAL_EACH_YEAR',
          config: {
            aggregationEntityType: 'requested',
            dataSourceEntityType: 'sub_district',
            dataSourceEntityFilter: {
              attributes_type: 'LESMIS_Target_District',
            },
          },
        },
      ],
    },
    transform: [
      {
        transform: 'updateColumns',
        insert: {
          organisationUnitCode: '=$organisationUnit',
          value: '=divide($value, 100)',
        },
        exclude: ['organisationUnit', 'dataElement', 'period'],
      },
    ],
  },
});

const getMapOverlay = (name, reportCode) => ({
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
    scaleType: 'performance',
    displayType: 'shaded-spectrum',
    measureLevel: 'SubDistrict',
    valueType: 'percentage',
    scaleBounds: {
      left: {
        max: 'auto',
      },
      right: {
        min: 'auto',
      },
    },
    periodGranularity: 'one_year_at_a_time',
  },
  countryCodes: '{"LA"}',
  projectCodes: '{laos_schools}',

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
