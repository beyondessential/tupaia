'use strict';

import { arrayToDbString, codeToId, insertObject } from '../utilities';
import { generateId } from '../utilities/generateId';

var dbm;
var type;
var seed;

const FIRST_MEDICINE_OVERLAY_SORT_ORDER = 13;

const LAST_MEDICINE_OVERLAY_SORT_ORDER = 62;

const FIRST_VACCINE_OVERLAY_SORT_ORDER = 171;

const ORIGINAL_CONSUMABLE_START_ORDER = 63; // Male condoms

const MEDICINES_AND_CONSUMABLES_OVERLAY_GROUP_CODE = 'Medicines_Consumables';

const COLD_CHAIN_IMMUNISATION_OVERLAY_GROUP_CODE = 'Cold_ChainImmunisation';

const OVERLAYS_TO_MOVE_TO_VACCINES = ['60', '61', '47'];

const OVERLAYS_TO_REMOVE_FIJI_ACCESS = [
  '15', // ADZL4000TCW000
  '19', // AMLM2012TAB000
  '20', // ARSNXXXXRDF000
  '22', // CAGNXXXXINJ000
  '23', // CFXNXXXXPFI000
  '25', // DEXA0040INJ006
  '28', // FRSFXXXXTAB000
  '32', // GLIB0050TAB000
  '33', // HEPB0000VAC000
  '39', // MXPAXXXXINJ000
  '40', // Jadelle
  '41', // LVGLXXXXTAB000
  '43', // MDPA2500TAB000
  '45', // MDZLXXXXINJ000
  '46', // MDZLXXXXTAB000
  '48', // NFPNXXXXCIR000
  '49', // Opioid
  '50', // ETLEXXXXTAB000
  '56', // SBML1000MDI002
  '58', // NALC0000INS000
  '59', // AZMNXXXXCAP000
  '62', // RTNLXXXXCAP007
  '63', // ZNSF0020SOD000
  '117', //	"SS172"
  '118', //	"SS173"
  '119', //	"SS174"
  '120', //	"SS175"
  '121', //	"SS176"
  '122', //	"SS177"
  '123', //	"SS178"
  '124', //	"SS179"
  '125', //	"SS180"
];

const NEW_FIJI_MEDICINES_OVERLAYS = [
  {
    code: '36f7d4bf',
    name: 'Atenolol 50mg cap/tab',
  },
  {
    code: '650f14bf',
    name: 'Tetracycline Eye Ointment',
  },
  {
    code: 'FijiBCSC50',
    name: 'Adrenaline Injection 1mg/mL',
  },
  {
    code: 'FijiBCSC51',
    name: 'Amlodipine Tablet 5mg',
  },
  {
    code: 'FijiBCSC57',
    name: 'Atropine Injection 500mcg/ml',
  },
  {
    code: 'FijiBCSC58',
    name: 'Atropine Sulphate eye drops1%',
  },
  {
    code: 'FijiBCSC59',
    name: 'Beclomethasone Inhaler 100mcg',
  },
  {
    code: 'FijiBCSC60',
    name: 'Benzhexol Tablet 2mg',
  },
  {
    code: 'FijiBCSC61',
    name: 'Benztropine Injection 2mg/ml',
  },
  {
    code: 'FijiBCSC62',
    name: 'Bupivacaine Heavy Injection 0.5% (WITH 8% DEXTROSE)',
  },
  {
    code: 'FijiBCSC63',
    name: 'Carbamazepine Tablet 200mg',
  },
  {
    code: 'FijiBCSC64',
    name: 'Cephalothin Injection 1g',
  },
  {
    code: 'FijiBCSC65',
    name: 'Chloral Hydrate Syrup 100mg/ml (100ml )',
  },
  {
    code: 'FijiBCSC66',
    name: 'Chloramphenicol Eye Drops 0.5%',
  },
  {
    code: 'FijiBCSC67',
    name: 'Chloramphenicol Eye Ointment 1%',
  },
  {
    code: 'FijiBCSC68',
    name: 'Chloramphenicol Sod. Succinate Injection 1g',
  },
  {
    code: 'FijiBCSC69',
    name: 'Chlorpromazine Tablets 100mg',
  },
  {
    code: 'FijiBCSC70',
    name: 'Cloxacillin Injection 500mg',
  },
  {
    code: 'FijiBCSC72',
    name: 'Dextrose 10% Injection 500ml Bag',
  },
  {
    code: 'FijiBCSC74',
    name: 'Digoxin Injection 250mcg/ml',
  },
  {
    code: 'FijiBCSC75',
    name: 'Digoxin Tablet 250mcg',
  },
  {
    code: 'FijiBCSC76',
    name: 'Dobutamine Injection 250mg/20ml',
  },
  {
    code: 'FijiBCSC77',
    name: 'Dopamine Injection 200mg/5ml',
  },
  {
    code: 'FijiBCSC81',
    name: 'Flucoxacillin Capsules 500mg',
  },
  {
    code: 'FijiBCSC83',
    name: 'Fluorescein Eye Drops 2%',
  },
  {
    code: 'FijiBCSC84',
    name: 'Fluphenazine Decanoate Injection 25mg/ml',
  },
  {
    code: 'FijiBCSC85',
    name: 'Frusemide 20mg/2ml',
  },
  {
    code: 'FijiBCSC86',
    name: 'Frusemide Tablet 40mg',
  },
  {
    code: 'FijiBCSC87',
    name: 'Frusemide Tablet 500mg',
  },
  {
    code: 'FijiBCSC89',
    name: 'Glipizide Tablets 5mg',
  },
  {
    code: 'FijiBCSC90',
    name: 'Glyceryl Trinitrate Tablets 600mcg',
  },
  {
    code: 'FijiBCSC91',
    name: 'Haloperidol Decanoate Injection 50mg/ml',
  },
  {
    code: 'FijiBCSC92',
    name: 'Haloperidol Injection 5mg/ml',
  },
  {
    code: 'FijiBCSC93',
    name: 'Haloperidol Tablets 5mg',
  },
  {
    code: 'FijiBCSC94',
    name: 'HBV Immunoglobulin Injection 300Units/ml',
  },
  {
    code: 'FijiBCSC95',
    name: 'Heparin Sodium Injection 25000u/5ml',
  },
  {
    code: 'FijiBCSC98',
    name: 'Hydrocortisone Cream 1%',
  },
  {
    code: 'FijiBCSC99',
    name: 'Hydrocortisone Sod. Succinate 100mg/2ml',
  },
  {
    code: 'FijiBCSC100',
    name: 'Hydroxypropylmethylcellulose (Ocucoat) Injection 20mg/ml',
  },
  {
    code: 'FijiBCSC102',
    name: 'Indomethacin Capsules 25mg',
  },
  {
    code: 'FijiBCSC103',
    name: 'Insulin - Isophane Injection 1000UNits/10ml',
  },
  {
    code: 'FijiBCSC105',
    name: 'Insulin Mixtard 70/30 Injection 1000UNits/10ml',
  },
  {
    code: 'FijiBCSC106',
    name: 'Isoflurane Liquid for inhalation 250mL',
  },
  {
    code: 'FijiBCSC107',
    name: 'Isoprenaline Injection 0.2mg/ml',
  },
  {
    code: 'FijiBCSC108',
    name: 'Isosorbide Dinitrate Tablets 10mg',
  },
  {
    code: 'FijiBCSC109',
    name: 'Lignocaine Plain Injection 2%',
  },
  {
    code: 'FijiBCSC111',
    name: 'Mannitol Injection 20% 500ml',
  },
  {
    code: 'FijiBCSC112',
    name: 'Mebendazole Tablets 100mg',
  },
  {
    code: 'FijiBCSC113',
    name: 'Medroxyprogesterone Tablets 10mg',
  },
  {
    code: 'FijiBCSC116',
    name: 'Miconazole Cream 2%',
  },
  {
    code: 'FijiBCSC117',
    name: 'Midazolam Injection 5mg/ml',
  },
  {
    code: 'FijiBCSC118',
    name: 'Morphine Sulphate Injection 10mg/ml',
  },
  {
    code: 'FijiBCSC119',
    name: 'Naloxone Injection 400mcg/ml',
  },
  {
    code: 'FijiBCSC120',
    name: 'Neostigmine Injection 2.5mg/ml',
  },
  {
    code: 'FijiBCSC121',
    name: 'Olanzapine Tablets 10mg',
  },
  {
    code: 'FijiBCSC123',
    name: 'Oxybuprocaine Eye Drops 0.40%',
  },
  {
    code: 'FijiBCSC125',
    name: 'Pancuronium bromide Injection 2mg/ml',
  },
  {
    code: 'FijiBCSC130',
    name: 'Phenobarbitone Injection 200mg/ml',
  },
  {
    code: 'FijiBCSC131',
    name: 'Phenytoin Sodium Injection 250mg/5ml',
  },
  {
    code: 'FijiBCSC132',
    name: 'Phenytoin Sodium Tablet 100mg',
  },
  {
    code: 'FijiBCSC134',
    name: 'Potassium Chloride Injection 7.46%w/v',
  },
  {
    code: 'FijiBCSC135',
    name: 'PPD Human Tuberculin (mantoux) Injection 100,000units/ml',
  },
  {
    code: 'FijiBCSC136',
    name: 'Prednisolone/Prednisone Tablet 5mg',
  },
  {
    code: 'FijiBCSC137',
    name: 'Promethazine Tablets 10mg',
  },
  {
    code: 'FijiBCSC138',
    name: 'Propofol Injection 200mg',
  },
  {
    code: 'FijiBCSC139',
    name: 'Salbutamol Respirator Solution 0.50%',
  },
  {
    code: 'FijiBCSC140',
    name: 'Salbutamol Tablets 4mg',
  },
  {
    code: 'FijiBCSC142',
    name: 'Sodium Valproate Elixir 40mg/ml',
  },
  {
    code: 'FijiBCSC143',
    name: 'Sodium Valproate EC Tablet 200mg',
  },
  {
    code: 'FijiBCSC144',
    name: 'Spironolactone Tablets 25mg',
  },
  {
    code: 'FijiBCSC145',
    name: 'Streptokinase Injection 1.5mU',
  },
  {
    code: 'FijiBCSC146',
    name: 'Suxamethonium Chloride Injection 50mg/ml',
  },
  {
    code: 'FijiBCSC148',
    name: 'Tropicamide eye drops 1%',
  },
  {
    code: 'FijiBCSC149',
    name: 'Verapamil Injection 2.5mg/ml',
  },
  {
    code: 'FijiBCSC150',
    name: 'Vitamin K Injection 1mg/ml',
  },
  {
    code: 'FijiBCSC151',
    name: 'Volume expander Solution Injection 500ml Bag',
  },
  {
    code: 'FijiBCSC152',
    name: 'Warfarin (MAREVAN BRAND) Tablet 1mg',
  },
  {
    code: 'FijiBCSC153',
    name: 'Warfarin (MAREVAN BRAND) Tablet 3mg',
  },
  {
    code: 'FijiBCSC154',
    name: 'Warfarin (MAREVAN BRAND) Tablet 5mg',
  },
];

const GLOBAL_MEDICINE_OVERLAY_ORDERS_BY_DATA_ELEMENT_CODES = [
  'FijiBCSC50',
  'FijiBCSC51',
  'AMXCXXXXSOD000',
  'AMXCXXXXPOL005',
  'AMPCXXXXPFI004',
  'ACSA1000TAB000',
  'ADZL4000TCW000',
  '36f7d4bf',
  'FijiBCSC57',
  'FijiBCSC58',
  'FijiBCSC59',
  'FijiBCSC60',
  'FijiBCSC61',
  'FijiBCSC62',
  'FijiBCSC63',
  'FijiBCSC64',
  'FijiBCSC65',
  'FijiBCSC66',
  'FijiBCSC67',
  'FijiBCSC68',
  'FijiBCSC69',
  'FijiBCSC70',
  'AMLM2012TAB000',
  'ARSNXXXXRDF000',
  'BZPNXXXXPFI000',
  'CAGNXXXXINJ000',
  'CFXNXXXXPFI000',
  'SXTP4008TAB000',
  'FijiBCSC72',
  'DEXA0040INJ006',
  'DZPM0050TAB000',
  'FijiBCSC74',
  'FijiBCSC75',
  'FijiBCSC76',
  'FijiBCSC77',
  'ENPL0050TAB000',
  'FRSFXXXXTAB000',
  'CLXNXXXXCAP004',
  'FijiBCSC81',
  'CLXNXXXXPOL0005',
  'FijiBCSC83',
  'FijiBCSC84',
  'FijiBCSC85',
  'FijiBCSC86',
  'FijiBCSC87',
  'GMCN0040INJ002',
  'GLIB0050TAB000',
  'FijiBCSC89',
  'FijiBCSC90',
  'FijiBCSC91',
  'FijiBCSC92',
  'FijiBCSC93',
  'FijiBCSC94',
  'FijiBCSC95',
  'HEPB0000VAC000',
  'HYDZXXXXXXX001',
  'HTHZ0250SOD000',
  'FijiBCSC98',
  'FijiBCSC99',
  'FijiBCSC100',
  'IBFNXXXXTAB000',
  'FijiBCSC102',
  'FijiBCSC103',
  'INSN1010INJ000',
  'FijiBCSC105',
  'FijiBCSC106',
  'FijiBCSC107',
  'FijiBCSC108',
  'FijiBCSC109',
  'MGSFXXXXINJ002',
  'MXPAXXXXINJ000',
  'Jadelle',
  'LVGLXXXXTAB000',
  'FijiBCSC111',
  'FijiBCSC112',
  'FijiBCSC113',
  'MTFN0500TAB001',
  'MDPA2500TAB000',
  'MDZLXXXXXXX000',
  'MDZLXXXXINJ000',
  'MDZLXXXXTAB000',
  'NFPNXXXXCIR000',
  'FijiBCSC116',
  'FijiBCSC117',
  'FijiBCSC118',
  'FijiBCSC119',
  'FijiBCSC120',
  'FijiBCSC121',
  'Opioid',
  'ETLEXXXXTAB000',
  'ORHS1000PFD000',
  'FijiBCSC123',
  'OXYT0010INJ000',
  'FijiBCSC125',
  'PCML0024SUS000',
  'PCML1000TAB000',
  'PCBZXXXXPFI000',
  'FijiBCSC130',
  'FijiBCSC131',
  'FijiBCSC132',
  'FijiBCSC134',
  'FijiBCSC135',
  'FijiBCSC136',
  'FijiBCSC137',
  'FijiBCSC138',
  'FijiBCSC139',
  'FijiBCSC140',
  'SBML1000MDI002',
  'NACL0009INS000',
  'NALC0000INS000',
  'FijiBCSC142',
  'FijiBCSC143',
  'FijiBCSC144',
  'FijiBCSC145',
  'FijiBCSC146',
  '650f14bf',
  'FijiBCSC148',
  'FijiBCSC149',
  'FijiBCSC150',
  'FijiBCSC151',
  'FijiBCSC152',
  'FijiBCSC153',
  'FijiBCSC154',
  'AZMNXXXXCAP000',
  'RTNLXXXXCAP007',
  'ZNSF0020SOD000',
];

const FIJI_VACCINES_OVERLAYS = [
  {
    code: 'FijiBCSC157',
    name: 'DPT-Hib-HBV 1 dose ',
  },
  {
    code: 'FijiBCSC158',
    name: 'HBV Infant 10mcg (1 dose)',
  },
  {
    code: 'FijiBCSC159',
    name: 'HBV Adult 20mcg/dose (10 doses)',
  },
  {
    code: 'FijiBCSC161',
    name: 'Polio Vaccine 10 doses',
  },
];

const NEW_VACCINES_OVERLAY_ORDER_BY_DATA_ELEMENT_CODES = [
  'BCGV0000VAC000',
  'FijiBCSC157',
  'FijiBCSC158',
  'FijiBCSC159',
  'MUMP0000VAC000',
  'FijiBCSC161',
  'TETN0000VAC000',
];

const CONSUMABLE_OVERLAY_IDS = [
  '64', // BCD59'
  '65', // BCD60'
  '66', // BCD68'
  '67', // BCD70'
  '68', // BCD71'
  '69', // BCD72'
  '70', // BCD73'
  '71', // BCD74'
  '72', // BCD75'
  '73', // BCD76'
  '74', // BCD77'
  '75', // BCD78'
  '76', // BCD79'
  '77', // BCD80'
  '78', // BCD81'
  '79', // BCD87'
  '80', // BCD88'
  '81', // BCD89'
  '82', // BCD90'
  '83', // BCD91'
  '84', // BCD92'
];

const BASE_FIJI_OVERLAY = {
  measureBuilderConfig: {},
  measureBuilder: 'valueForOrgGroup',
  presentationOptions: {
    displayType: 'color',
    measureLevel: 'Facility',
  },
  countryCodes: '{FJ}',
  projectCodes: '{disaster,explore}',
};

const generateMapOverlayIdFromName = overlayName => {
  const splittedOverlayNames = overlayName
    .replace(/[^\w\s]/gi, '') // Retain only alphanumeric characters, underscores and spaces.
    .trim()
    .split(' ');

  // remove empty elements
  return splittedOverlayNames.filter(name => name !== '').join('_');
};

const getLargestSortOrderOfOverlayInGroup = async (db, groupCode) =>
  db.runSql(`
    select MAX(map_overlay_group_relation.sort_order) as "largestSortOrder"
    from "mapOverlay"
    inner join map_overlay_group_relation on "mapOverlay".id = map_overlay_group_relation.child_id
    inner join map_overlay_group on map_overlay_group.id = map_overlay_group_relation.map_overlay_group_id
    where map_overlay_group.code = '${groupCode}'
    group by map_overlay_group.code
`);

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const updateMapOverlaySortOrder = async (db, sortOrder, childId, groupId) => {
  await db.runSql(`
    UPDATE map_overlay_group_relation
    SET sort_order = ${sortOrder}
    WHERE child_id = '${childId}'
    AND map_overlay_group_id = '${groupId}'
`);
};

/**
 * Shift the Consumable overlays by increasing their sort orders so that we can put new Medicine Overlays in between.
 * Order should be: Medicine Overlays -> Consumable Overlays
 * @param {*} db
 */
const shiftConsumablesOverlayOrders = async db => {
  const medicinesAndConsumablesGroupId = await codeToId(
    db,
    'map_overlay_group',
    MEDICINES_AND_CONSUMABLES_OVERLAY_GROUP_CODE,
  );

  const consumableOverlayStartSortOrder =
    LAST_MEDICINE_OVERLAY_SORT_ORDER + NEW_FIJI_MEDICINES_OVERLAYS.length;

  for (let i = 0; i < CONSUMABLE_OVERLAY_IDS.length; i++) {
    const consumableOverlayId = CONSUMABLE_OVERLAY_IDS[i];
    const newSortOrder = consumableOverlayStartSortOrder + i + 1;
    await updateMapOverlaySortOrder(
      db,
      newSortOrder,
      consumableOverlayId,
      medicinesAndConsumablesGroupId,
    );
  }
};

const resetConsumablesOverlayOrders = async db => {
  const medicinesAndConsumablesGroupId = await codeToId(
    db,
    'map_overlay_group',
    MEDICINES_AND_CONSUMABLES_OVERLAY_GROUP_CODE,
  );

  for (let i = 0; i < CONSUMABLE_OVERLAY_IDS.length; i++) {
    const consumableOverlayId = CONSUMABLE_OVERLAY_IDS[i];
    const oldSortOrder = ORIGINAL_CONSUMABLE_START_ORDER + i;

    await updateMapOverlaySortOrder(
      db,
      oldSortOrder,
      consumableOverlayId,
      medicinesAndConsumablesGroupId,
    );
  }
};

/**
 * Add these medicine overlays in between the last Medicine Overlay
 * and the first Consumable Overlay in 'Medicines and Consumables' overlay group
 * @param {*} db
 */
const addFijiMedicinesOverlays = async db => {
  const medicinesAndConsumablesGroupId = await codeToId(
    db,
    'map_overlay_group',
    MEDICINES_AND_CONSUMABLES_OVERLAY_GROUP_CODE,
  );

  for (let i = 0; i < NEW_FIJI_MEDICINES_OVERLAYS.length; i++) {
    const { code, name } = NEW_FIJI_MEDICINES_OVERLAYS[i];
    const overlayObject = {
      ...BASE_FIJI_OVERLAY,
      userGroup: 'Admin',
      id: generateMapOverlayIdFromName(name),
      dataElementCode: code,
      name,
    };
    const overlayRelation = {
      id: generateId(),
      map_overlay_group_id: medicinesAndConsumablesGroupId,
      child_id: overlayObject.id,
      child_type: 'mapOverlay',
      sort_order: LAST_MEDICINE_OVERLAY_SORT_ORDER + i + 1,
    };

    await insertObject(db, 'mapOverlay', overlayObject);
    await insertObject(db, 'map_overlay_group_relation', overlayRelation);
  }
};

const updateSortOrderIfOverlayExists = async (db, dataElementCode, sortOrder, groupId) => {
  const overlay = (
    await db.runSql(`
      select "mapOverlay".* from "mapOverlay"
      inner join map_overlay_group_relation on "mapOverlay".id = map_overlay_group_relation.child_id
      inner join map_overlay_group on map_overlay_group.id = map_overlay_group_relation.map_overlay_group_id
      where map_overlay_group.id = '${groupId}'
      and "mapOverlay"."dataElementCode" = '${dataElementCode}';
    `)
  ).rows[0];

  if (overlay) {
    await db.runSql(`
      update map_overlay_group_relation
      set sort_order = ${sortOrder}
      where child_id = '${overlay.id}'
      and map_overlay_group_id = '${groupId}';
    `);

    return true;
  }

  return false;
};

const reorderAllMedicineOverlays = async db => {
  let sortOrder = FIRST_MEDICINE_OVERLAY_SORT_ORDER;
  const medicinesAndConsumablesGroupId = await codeToId(
    db,
    'map_overlay_group',
    MEDICINES_AND_CONSUMABLES_OVERLAY_GROUP_CODE,
  );

  for (let i = 0; i < GLOBAL_MEDICINE_OVERLAY_ORDERS_BY_DATA_ELEMENT_CODES.length; i++) {
    const dataElementCode = GLOBAL_MEDICINE_OVERLAY_ORDERS_BY_DATA_ELEMENT_CODES[i];
    const updated = await updateSortOrderIfOverlayExists(
      db,
      dataElementCode,
      sortOrder,
      medicinesAndConsumablesGroupId,
    );

    if (updated) {
      sortOrder++;
    }
  }
};

const reorderAllVaccineOverlays = async db => {
  let sortOrder = FIRST_VACCINE_OVERLAY_SORT_ORDER;
  const coldChainImmunisationGroupId = await codeToId(
    db,
    'map_overlay_group',
    COLD_CHAIN_IMMUNISATION_OVERLAY_GROUP_CODE,
  );

  for (let i = 0; i < NEW_VACCINES_OVERLAY_ORDER_BY_DATA_ELEMENT_CODES.length; i++) {
    const dataElementCode = NEW_VACCINES_OVERLAY_ORDER_BY_DATA_ELEMENT_CODES[i];
    const updated = await updateSortOrderIfOverlayExists(
      db,
      dataElementCode,
      sortOrder,
      coldChainImmunisationGroupId,
    );

    if (updated) {
      sortOrder++;
    }
  }
};

const moveOverlaysFromMedicinesToVaccines = async (db, oldGroupCode, newGroupCode) => {
  let { largestSortOrder: sortOrder } = (
    await getLargestSortOrderOfOverlayInGroup(db, newGroupCode)
  ).rows[0];

  const newGroupId = await codeToId(db, 'map_overlay_group', newGroupCode);

  const oldGroupId = await codeToId(db, 'map_overlay_group', oldGroupCode);

  for (const overlayId of OVERLAYS_TO_MOVE_TO_VACCINES) {
    sortOrder++;

    await db.runSql(`
      UPDATE map_overlay_group_relation
      SET map_overlay_group_id = '${newGroupId}',
      sort_order = ${sortOrder}
      WHERE child_id = '${overlayId}'
      AND map_overlay_group_id = '${oldGroupId}';
  `);

    sortOrder++;
  }
};

/**
 * Add the Vaccine Overlay at the bottom of 'Cold Chain/Immunisation' group.
 * @param {*} db
 */
const addFijiVaccinesOverlays = async db => {
  const coldChainImmunisationGroupId = await codeToId(
    db,
    'map_overlay_group',
    COLD_CHAIN_IMMUNISATION_OVERLAY_GROUP_CODE,
  );

  const { largestSortOrder } = (
    await getLargestSortOrderOfOverlayInGroup(db, COLD_CHAIN_IMMUNISATION_OVERLAY_GROUP_CODE)
  ).rows[0];

  for (let i = 0; i < FIJI_VACCINES_OVERLAYS.length; i++) {
    const { code, name } = FIJI_VACCINES_OVERLAYS[i];
    const overlayObject = {
      ...BASE_FIJI_OVERLAY,
      userGroup: 'Donor',
      id: generateMapOverlayIdFromName(name),
      dataElementCode: code,
      name,
    };
    const overlayRelation = {
      id: generateId(),
      map_overlay_group_id: coldChainImmunisationGroupId,
      child_id: overlayObject.id,
      child_type: 'mapOverlay',
      sort_order: largestSortOrder + i + 1,
    };

    await insertObject(db, 'mapOverlay', overlayObject);
    await insertObject(db, 'map_overlay_group_relation', overlayRelation);
  }
};

const removeFijiMedicinesOverlays = async db => {
  for (let i = 0; i < NEW_FIJI_MEDICINES_OVERLAYS.length; i++) {
    const { name } = NEW_FIJI_MEDICINES_OVERLAYS[i];
    const overlayId = generateMapOverlayIdFromName(name);

    await db.runSql(`
      DELETE FROM "mapOverlay" WHERE "id" = '${overlayId}';
    `);

    await db.runSql(`
      DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${overlayId}';
    `);
  }
};

const removeFijiVaccinesOverlays = async db => {
  for (let i = 0; i < FIJI_VACCINES_OVERLAYS.length; i++) {
    const { name } = FIJI_VACCINES_OVERLAYS[i];
    const overlayId = generateMapOverlayIdFromName(name);

    await db.runSql(`
      DELETE FROM "mapOverlay" WHERE "id" = '${overlayId}';
    `);

    await db.runSql(`
      DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${overlayId}';
    `);
  }
};

exports.up = async function (db) {
  // Remove FJ access from some irrelevant Medicines Overlays in Fiji
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "countryCodes" = ARRAY_REMOVE("countryCodes", 'FJ')
    WHERE id IN (${arrayToDbString(OVERLAYS_TO_REMOVE_FIJI_ACCESS)});
 `);

  await addFijiMedicinesOverlays(db);

  await reorderAllMedicineOverlays(db);

  await moveOverlaysFromMedicinesToVaccines(
    db,
    MEDICINES_AND_CONSUMABLES_OVERLAY_GROUP_CODE,
    COLD_CHAIN_IMMUNISATION_OVERLAY_GROUP_CODE,
  );

  await addFijiVaccinesOverlays(db);

  await reorderAllVaccineOverlays(db);

  await shiftConsumablesOverlayOrders(db);
};

exports.down = async function (db) {
  // Add FJ access back for some irrelevant Medicines Overlays in Fiji
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "countryCodes" = ARRAY_APPEND("countryCodes", 'FJ')
    WHERE id IN (${arrayToDbString(OVERLAYS_TO_REMOVE_FIJI_ACCESS)});
 `);

  await removeFijiMedicinesOverlays(db);

  await reorderAllMedicineOverlays(db);

  await moveOverlaysFromMedicinesToVaccines(
    db,
    COLD_CHAIN_IMMUNISATION_OVERLAY_GROUP_CODE,
    MEDICINES_AND_CONSUMABLES_OVERLAY_GROUP_CODE,
  );

  await removeFijiVaccinesOverlays(db);

  await reorderAllVaccineOverlays(db);

  await resetConsumablesOverlayOrders(db);
};

exports._meta = {
  version: 1,
};
