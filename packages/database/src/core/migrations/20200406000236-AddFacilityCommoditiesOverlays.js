'use strict';

import { insertObject, arrayToDbString } from '../utilities';

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

const DATA_ELEMENTS = [
  {
    idSuffix: 'Water',
    code: 'COVID-19FacAssTool_10',
    name: 'Water (for hand washing)',
    measureBuilder: 'valueForOrgGroup',
  },
  {
    idSuffix: 'Soap',
    code: 'COVID-19FacAssTool_11',
    name: 'Soap (for hand washing)',
    measureBuilder: 'valueForOrgGroup',
  },
  {
    idSuffix: 'Hand_sanitizer',
    code: 'COVID-19FacAssTool_12',
    name: 'Alcohol hand sanitizer',
    measureBuilder: 'valueForOrgGroup',
  },
  {
    idSuffix: 'Gloves',
    code: 'COVID-19FacAssTool_14',
    name: 'Gloves',
    measureBuilder: 'checkConditions',
  },
  {
    idSuffix: 'Face_masks',
    code: 'COVID-19FacAssTool_15',
    name: 'Face masks',
    measureBuilder: 'checkConditions',
  },
  {
    idSuffix: 'Paracetamol',
    code: 'COVID-19FacAssTool_16',
    name: 'Paracetamol',
    measureBuilder: 'checkConditions',
  },
  {
    idSuffix: 'Surface_disinfectant',
    code: 'COVID-19FacAssTool_18',
    name: 'Surface disinfectant',
    measureBuilder: 'valueForOrgGroup',
  },
  {
    idSuffix: 'Oxygen_concentrator',
    code: 'COVID-19FacAssTool_26',
    name: 'Oxygen concentrator',
    measureBuilder: 'valueForOrgGroup',
  },
  {
    idSuffix: 'Oxygen_bottles',
    code: 'COVID-19FacAssTool_27',
    name: 'Oxygen (bottles)',
    measureBuilder: 'valueForOrgGroup',
  },
  {
    idSuffix: 'Oxygen_masks',
    code: 'COVID-19FacAssTool_28',
    name: 'Oxygen masks',
    measureBuilder: 'valueForOrgGroup',
  },
  {
    idSuffix: 'Pulse_oximiter',
    code: 'COVID-19FacAssTool_29',
    name: 'Pulse oximiter',
    measureBuilder: 'valueForOrgGroup',
  },
  {
    idSuffix: 'Ventilator',
    code: 'COVID-19FacAssTool_30',
    name: 'Ventilator',
    measureBuilder: 'valueForOrgGroup',
  },
  {
    idSuffix: 'ICU_beds',
    code: 'COVID-19FacAssTool_21',
    name: 'ICU beds',
    measureBuilder: 'checkConditions',
  },
  {
    idSuffix: 'Isolation_beds',
    code: 'COVID-19FacAssTool_22',
    name: 'Isolation beds',
    measureBuilder: 'checkConditions',
  },
];

const BASE_ID = 'COVID_Facility_Commodities';
const BASE_OVERLAY = {
  groupName: 'COVID-19 Facility Commodities',
  userGroup: 'COVID-19',
  displayType: 'color',
  customColors: 'Green,Red,Orange',
  measureBuilderConfig: {
    aggregationEntityType: 'facility',
  },
  measureBuilder: 'valueForOrgGroup',
  countryCodes: '{TO}',
};

exports.up = async function (db) {
  const isPositiveCondition = { condition: { operator: '>', value: 0 } };

  await Promise.all(
    DATA_ELEMENTS.map(({ idSuffix, code: dataElementCode, name, measureBuilder }, i) => {
      const extraConfig = measureBuilder === 'checkConditions' ? isPositiveCondition : {};

      return insertObject(db, 'mapOverlay', {
        ...BASE_OVERLAY,
        id: `${BASE_ID}_${idSuffix}`,
        name,
        dataElementCode,
        sortOrder: i + 1,
        measureBuilder,
        measureBuilderConfig: { ...BASE_OVERLAY.measureBuilderConfig, ...extraConfig },
      });
    }),
  );
};

exports.down = async function (db) {
  const ids = DATA_ELEMENTS.map(({ idSuffix }) => `${BASE_ID}_${idSuffix}`);
  await db.runSql(`DELETE FROM "mapOverlay" WHERE id IN (${arrayToDbString(ids)})`);
};

exports._meta = {
  version: 1,
};
