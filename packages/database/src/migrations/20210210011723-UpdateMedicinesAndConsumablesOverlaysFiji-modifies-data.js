'use strict';

import { arrayToDbString, codeToId, insertObject } from '../utilities';
import { generateId } from '../utilities/generateId';

var dbm;
var type;
var seed;

const LAST_MEDICINE_OVERLAY_SORT_ORDER = 62;

const ORIGINAL_CONSUMABLE_START_ORDER = 63; // Male condoms

const MEDICINES_AND_CONSUMABLES_OVERLAY_GROUP_CODE = 'Medicines_Consumables';

const COLD_CHAIN_IMMUNISATION_OVERLAY_GROUP_CODE = 'Cold_ChainImmunisation';

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
  '44', // MDZLXXXXXXX000
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
];

const FIJI_MEDICINES_OVERLAYS = [
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
    LAST_MEDICINE_OVERLAY_SORT_ORDER + FIJI_MEDICINES_OVERLAYS.length;

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

  for (let i = 0; i < FIJI_MEDICINES_OVERLAYS.length; i++) {
    const { code, name } = FIJI_MEDICINES_OVERLAYS[i];
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
  for (let i = 0; i < FIJI_MEDICINES_OVERLAYS.length; i++) {
    const { name } = FIJI_MEDICINES_OVERLAYS[i];
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

  await addFijiVaccinesOverlays(db);

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

  await removeFijiVaccinesOverlays(db);

  await resetConsumablesOverlayOrders(db);
};

exports._meta = {
  version: 1,
};
