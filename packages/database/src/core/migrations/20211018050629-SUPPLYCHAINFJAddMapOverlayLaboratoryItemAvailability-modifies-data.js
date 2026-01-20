import { insertObject, generateId, codeToId } from '../utilities';

('use strict');

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

const PERMISSION_GROUP = 'Fiji Supply Chain';

const LAB_ITEMS = [
  {
    dataElements: ['FijiBCSC22'],
    name: 'Buffer Pack',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_buffer_pack_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_buffer_pack',
    sortOrder: '0',
  },
  {
    dataElements: ['FijiBCSC23'],
    name: 'Wash and CD Pack 348',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_wash_cd_pack_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_wash_cd_pack',
    sortOrder: '1',
  },
  {
    dataElements: ['FijiBCSC24'],
    name: 'Cellpack DCL 20L',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_cellpack_dcl_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_cellpack_dcl',
    sortOrder: '2',
  },
  {
    dataElements: ['FijiBCSC25'],
    name: 'Aerobic Blood Culture Bottles BacT/Alert - FA',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_aerobic_blood_culture_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_aerobic_blood_culture',
    sortOrder: '3',
  },
  {
    dataElements: ['FijiBCSC26'],
    name: 'Anaerobic Blood Culture Bottles BacT/Alert - SN',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_anaerobic_blood_culture_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_anaerobic_blood_culture',
    sortOrder: '4',
  },
  {
    dataElements: ['FijiBCSC27'],
    name: 'Anti-A monoclonal reagent 10ml vial',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_anti_a_monoclonal_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_anti_a_monoclonal',
    sortOrder: '5',
  },
  {
    dataElements: ['FijiBCSC28'],
    name: 'Anti-B monoclonal reagent 10ml vial',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_anti_b_monoclonal_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_anti_b_monoclonal',
    sortOrder: '6',
  },
  {
    dataElements: ['FijiBCSC29'],
    name: 'Anti-D duoclone IgM IgG blend 10ml vial',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_anti_d_duoclone_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_anti_d_duoclone',
    sortOrder: '7',
  },
  {
    dataElements: ['FijiBCSC30'],
    name: 'BD Sodium Citrate tubes (1.8ml) (1 x 100)',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_bd_sodium_citrate_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_bd_sodium_citrate',
    sortOrder: '8',
  },
  {
    dataElements: ['FijiBCSC31'],
    name: 'Container 70ml sterile screw to pp labelled pink cap (Sputum Bottle)',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_container_sterile_sputum_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_container_sterile_sputum',
    sortOrder: '9',
  },
  {
    dataElements: ['FijiBCSC32'],
    name: 'Container Sterile Urine 70ml Screw to pp labeled Yellow cap, Technoplas 500/box',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_container_technoplas_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_container_technoplas',
    sortOrder: '10',
  },
  {
    dataElements: ['FijiBCSC33'],
    name: 'Determine HepBsAntigen SP 100T',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_hepbsantigen_sp_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_hepbsantigen_sp',
    sortOrder: '11',
  },
  {
    dataElements: ['FijiBCSC34'],
    name: 'Determine HIV 1/2 SP 100T',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_hiv_sp_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_hiv_sp',
    sortOrder: '12',
  },
  {
    dataElements: ['FijiBCSC35'],
    name: 'Diluent 20L - BC 3000 Analyser',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_diluent_bc_3000_analyser_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_diluent_bc_3000_analyser',
    sortOrder: '13',
  },
  {
    dataElements: ['FijiBCSC36'],
    name: 'DT7D2543-Determine Syphilis SP 100T',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_syphilis_sp_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_syphilis_sp',
    sortOrder: '14',
  },
  {
    dataElements: ['FijiBCSC37'],
    name:
      'Elite polyspecific Anti-human globulin blended rabbit monoclonal antihuman globulin 10ml',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_antihuman_globulin_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_antihuman_globulin',
    sortOrder: '15',
  },
  {
    dataElements: ['FijiBCSC38'],
    name: 'Greiner Vacuette K2E EDTA K2 Anticoagulant Tubes 13x75mm (rack of  100s)',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_anticoagulant_tubes_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_anticoagulant_tubes',
    sortOrder: '16',
  },
  {
    dataElements: ['FijiBCSC39'],
    name: 'HbA1c: BS-800M1 Reagents',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_bs_800m1_reagents_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_bs_800m1_reagents',
    sortOrder: '17',
  },
  {
    dataElements: ['FijiBCSC40'],
    name: 'Lamp 801-BA-80-00001-00',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_lamp_801_ba_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_lamp_801_ba',
    sortOrder: '18',
  },
  {
    dataElements: ['FijiBCSC41'],
    name: 'Liss ready for use 2500ml bottle',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_liss_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_liss',
    sortOrder: '19',
  },
  {
    dataElements: ['FijiBCSC42'],
    name: 'Macro-Vue RPR card test #104 300/test',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_macrovue_rpr_card_test_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_macrovue_rpr_card_test',
    sortOrder: '20',
  },
  {
    dataElements: ['FijiBCSC43'],
    name: 'Microbact 12 A (Identification Kits, Box of 120tests)',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_microbact_12_a_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_microbact_12_a',
    sortOrder: '21',
  },
  {
    dataElements: ['FijiBCSC44'],
    name: 'Microbact 12 B (Identification Kits 120tests/box)',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_microbact_12_b_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_microbact_12_b',
    sortOrder: '22',
  },
  {
    dataElements: ['FijiBCSC45'],
    name: 'MP9B8004030-Leptospira IgM Dip S-25T',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_leptospira_igm_dip_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_leptospira_igm_dip',
    sortOrder: '23',
  },
  {
    dataElements: ['FijiBCSC46'],
    name: 'MPBR70700-Dengue NSI Antigen Strip 25/pkt',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_dengue_nsi_antigen_strip_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_dengue_nsi_antigen_strip',
    sortOrder: '24',
  },
  {
    dataElements: ['FijiBCSC47'],
    name: 'Paediatric Blood Culture Bottles BacT/Alert - PF Bottle',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_paediatric_blood_culture_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_paediatric_blood_culture',
    sortOrder: '25',
  },
  {
    dataElements: ['FijiBCSC48'],
    name: 'Reagent Module(Cal A, Cal B, Waste) ISE Module - BS 200 Reagents',
    reportCode: 'SUPPLYCHAIN_FIJI_current_avail_items_reagent_module_cal_a_b_waste_map',
    code: 'SUPPLYCHAIN_FIJI_current_avail_items_reagent_module_cal_a_b_waste',
    sortOrder: '26',
  },
];

const overlayGroupRecord = {
  name: 'Laboratory Item Availability',
  code: 'SUPPLY_CHAIN_FIJI_Laboratory_Item_Availability',
};

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

const createMapOverlay = (name, reportCode, code, mapOverlayId) => ({
  id: mapOverlayId,
  name,
  code,
  permission_group: PERMISSION_GROUP,
  data_services: [{ isDataRegional: true }],
  config: {
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
  country_codes: '{"FJ"}',
  project_codes: '{supplychain_fiji}',
  report_code: reportCode,
});

export const nameToId = async (db, table, name) => {
  const record = await db.runSql(`SELECT id FROM "${table}" WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

const addMapOverlayGroup = async (db, parentCode, { name, code }) => {
  const parentId = await codeToId(db, 'map_overlay_group', parentCode);
  const overlayGroupId = generateId();
  await insertObject(db, 'map_overlay_group', { id: overlayGroupId, name, code });
  return insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: parentId,
    child_id: overlayGroupId,
    child_type: 'mapOverlayGroup',
  });
};

const addMapOverlay = async (db, parentCode, config) => {
  const { dataElements, reportCode, code, name, sortOrder } = config;
  const report = createReport(reportCode, dataElements);
  const mapOverlayId = generateId();
  const mapOverlay = createMapOverlay(name, reportCode, code, mapOverlayId);
  const permissionGroupId = await nameToId(db, 'permission_group', PERMISSION_GROUP);
  await insertObject(db, 'report', {
    id: generateId(),
    permission_group_id: permissionGroupId,
    ...report,
  });
  await insertObject(db, 'map_overlay', mapOverlay);

  const mapOverlayGroupId = await codeToId(db, 'map_overlay_group', parentCode);
  return insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverlayGroupId,
    child_id: mapOverlayId,
    child_type: 'mapOverlay',
    sort_order: sortOrder,
  });
};

exports.up = async function (db) {
  // Add map overlay group
  await addMapOverlayGroup(db, 'Root', overlayGroupRecord);

  // Add map overlays
  for (const labItem of LAB_ITEMS) {
    await addMapOverlay(db, overlayGroupRecord.code, labItem);
  }
};

const removeMapOverlay = (db, reportCode, overlayId) => {
  return db.runSql(`
    DELETE FROM "report" WHERE code = '${reportCode}';
    DELETE FROM "map_overlay" WHERE "id" = '${overlayId}';
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${overlayId}';
  `);
};

const removeMapOverlayGroupRelation = async (db, groupCode) => {
  const overlayId = await codeToId(db, 'map_overlay_group', groupCode);
  await db.runSql(`
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${overlayId}';
  `);
};

exports.down = async function (db) {
  // Remove Map Overlay Group Relation
  await removeMapOverlayGroupRelation(db, overlayGroupRecord.code);

  // Remove Map Overlays
  for (const labItem of LAB_ITEMS) {
    const overlayId = await codeToId(db, 'map_overlay', labItem.code);
    await removeMapOverlay(db, labItem.reportCode, overlayId);
  }

  // Remove Map Overlay Group
  await db.runSql(`
    DELETE FROM "map_overlay_group" WHERE "code" = '${overlayGroupRecord.code}';
  `);
};

exports._meta = {
  version: 1,
};
