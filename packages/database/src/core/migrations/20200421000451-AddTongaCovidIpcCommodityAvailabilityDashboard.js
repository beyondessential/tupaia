'use strict';

import { insertObject } from '../utilities/migration';

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

const GROUP = {
  code: 'TO_Covid_Country',
  name: 'COVID-19',
  organisationUnitCode: 'TO',
  userGroup: 'COVID-19',
  organisationLevel: 'Country',
};

const REPORT = {
  id: 'TO_COVID_Percent_IPC_Commodity_Availability',
  dataBuilder: 'tableOfPercentagesOfValueCounts',
  dataBuilderConfig: {
    rows: [
      'Water for hand washing',
      'Soap for hand washing',
      'Alcohol hand sanitizer',
      'Disposable gloves',
      'Face masks',
      'Paracetamol tablets',
      'Equipment cleaning and disinfectant products',
      'Oxygen concentrator',
      'Oxygen bottles',
      'Oxygen masks',
      'Pulse oximiter',
      'Ventilator',
    ],
    columns: ['% with commodity in stock'],
    cells: [
      [
        {
          numerator: {
            dataValues: ['COVID-19FacAssTool_10'],
            valueOfInterest: 1,
          },
          denominator: { dataValues: ['COVID-19FacAssTool_10'], valueOfInterest: '*' },
          key: 'COVID-19FacAssTool_10_Yes',
        },
      ],
      [
        {
          numerator: {
            dataValues: ['COVID-19FacAssTool_11'],
            valueOfInterest: 1,
          },
          denominator: { dataValues: ['COVID-19FacAssTool_11'], valueOfInterest: '*' },
          key: 'COVID-19FacAssTool_11_Yes',
        },
      ],
      [
        {
          numerator: {
            dataValues: ['COVID-19FacAssTool_12'],
            valueOfInterest: 1,
          },
          denominator: { dataValues: ['COVID-19FacAssTool_12'], valueOfInterest: '*' },
          key: 'COVID-19FacAssTool_12_Yes',
        },
      ],
      [
        {
          numerator: {
            dataValues: ['COVID-19FacAssTool_14'],
            valueOfInterest: { operator: '>=', value: 1 },
          },
          denominator: { dataValues: ['COVID-19FacAssTool_14'], valueOfInterest: '*' },
          key: 'COVID-19FacAssTool_14_Yes',
        },
      ],
      [
        {
          numerator: {
            dataValues: ['COVID-19FacAssTool_15'],
            valueOfInterest: { operator: '>=', value: 1 },
          },
          denominator: { dataValues: ['COVID-19FacAssTool_15'], valueOfInterest: '*' },
          key: 'COVID-19FacAssTool_15_Yes',
        },
      ],
      [
        {
          numerator: {
            dataValues: ['COVID-19FacAssTool_16'],
            valueOfInterest: { operator: '>=', value: 1 },
          },
          denominator: { dataValues: ['COVID-19FacAssTool_16'], valueOfInterest: '*' },
          key: 'COVID-19FacAssTool_16_Yes',
        },
      ],
      [
        {
          numerator: {
            dataValues: ['COVID-19FacAssTool_18'],
            valueOfInterest: 1,
          },
          denominator: { dataValues: ['COVID-19FacAssTool_18'], valueOfInterest: '*' },
          key: 'COVID-19FacAssTool_18_Yes',
        },
      ],
      [
        {
          numerator: {
            dataValues: ['COVID-19FacAssTool_26'],
            valueOfInterest: 1,
          },
          denominator: { dataValues: ['COVID-19FacAssTool_26'], valueOfInterest: '*' },
          key: 'COVID-19FacAssTool_26_Yes',
        },
      ],
      [
        {
          numerator: {
            dataValues: ['COVID-19FacAssTool_27'],
            valueOfInterest: 1,
          },
          denominator: { dataValues: ['COVID-19FacAssTool_27'], valueOfInterest: '*' },
          key: 'COVID-19FacAssTool_27_Yes',
        },
      ],
      [
        {
          numerator: {
            dataValues: ['COVID-19FacAssTool_28'],
            valueOfInterest: 1,
          },
          denominator: { dataValues: ['COVID-19FacAssTool_28'], valueOfInterest: '*' },
          key: 'COVID-19FacAssTool_28_Yes',
        },
      ],
      [
        {
          numerator: {
            dataValues: ['COVID-19FacAssTool_29'],
            valueOfInterest: 1,
          },
          denominator: { dataValues: ['COVID-19FacAssTool_29'], valueOfInterest: '*' },
          key: 'COVID-19FacAssTool_29_Yes',
        },
      ],
      [
        {
          numerator: {
            dataValues: ['COVID-19FacAssTool_30'],
            valueOfInterest: 1,
          },
          denominator: { dataValues: ['COVID-19FacAssTool_30'], valueOfInterest: '*' },
          key: 'COVID-19FacAssTool_30_Yes',
        },
      ],
    ],
  },
  viewJson: {
    name: '% of surveyed facilities with IPC commodities in stock',
    type: 'matrix',
    placeholder: '/static/media/PEHSMatrixPlaceholder.png',
    valueType: 'percentage',
  },
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardGroup', GROUP);
  await insertObject(db, 'dashboardReport', REPORT);

  return db.runSql(`
     UPDATE
       "dashboardGroup"
     SET
       "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
     WHERE
       "code" = '${GROUP.code}';
   `);
};

exports.down = function (db) {
  return db.runSql(`
     DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';
     DELETE FROM "dashboardGroup" WHERE "code" = '${GROUP.code}';
   `);
};

exports._meta = {
  version: 1,
};
