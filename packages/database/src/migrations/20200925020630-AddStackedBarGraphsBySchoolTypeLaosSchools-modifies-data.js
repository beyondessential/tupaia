'use strict';

import { insertObject, arrayToDbString } from '../utilities/migration';

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

const PRE_SCHOOL = 'Pre-School';
const PRIMARY_SCHOOL = 'Primary';
const SECONDARY_SCHOOL = 'Secondary';
const DASHBOARD_GROUP_CODES = [
  'LA_Laos_Schools_Country_Laos_Schools_User',
  'LA_Laos_Schools_Province_Laos_Schools_User',
  'LA_Laos_Schools_District_Laos_Schools_User',
];

const REPORTS = [
  {
    id: 'Laos_Schools_Distance_To_Grid_By_School_Type',
    name: 'Schools With No Electricity - Distance to Grid, % of Schools',
    dataElement: 'SchCVD011',
  },
  {
    id: 'Laos_Schools_Age_Of_Computers_By_School_Type',
    name: 'Age of Functioning Computers, % of Schools',
    dataElement: 'SchCVD014',
  },
  {
    id: 'Laos_Schools_Used_as_Quarantine_Centre_By_School_Type',
    name: 'Schools Used as Quarantine Centre, % of Schools',
    dataElement: 'SchCVD002',
  },
  {
    id: 'Laos_Schools_Drinking_Water_Source_By_School_Type',
    name: 'Clean Drinking Water Source, % of Schools',
    dataElement: 'SchCVD029',
  },
  {
    // This one is different
    id: 'Laos_Schools_Water_Supply_Source_By_School_Type',
    name: 'Water Supply Source, % of Schools',
    dataElementToString: {
      SchCVD010a: { valueOfInterest: 'Yes', displayString: 'Tap water' },
      SchCVD010b: { valueOfInterest: 'Yes', displayString: 'Borehole' },
      SchCVD010c: { valueOfInterest: 'Yes', displayString: 'Well' },
      SchCVD010d: { valueOfInterest: 'Yes', displayString: 'Spring water (gravity-fed system)' },
      SchCVD010e: { valueOfInterest: 'Yes', displayString: 'River/stream' },
      SchCVD010f: { valueOfInterest: 'Yes', displayString: 'Pond' },
      SchCVD010g: { valueOfInterest: 'Yes', displayString: 'Reservoir' },
      SchCVD010i: { valueOfInterest: 'Yes', displayString: 'Rainwater harvesting' },
      SchCVD010h: { valueOfInterest: 'Yes', displayString: 'Other' },
    },
  },
  {
    // This one too
    id: 'Laos_Schools_Teachers_Following_MoES_By_School_Type',
    name: 'Teachers Following MoES Programmes at Home, % of Schools',
    dataElementToString: {
      SchCVD016a: { valueOfInterest: 'Yes', displayString: 'TV' },
      SchCVD016b: { valueOfInterest: 'Yes', displayString: 'Radio' },
      SchCVD016c: { valueOfInterest: 'Yes', displayString: 'Online (Facebook, YouTube, etc.)' },
    },
  },
  {
    // This one too
    id: 'Laos_Schools_Students_Following_MoES_By_School_Type',
    name: 'Students Following MoES Programmes at Home, % of Schools',
    dataElementToString: {
      SchCVD017a: { valueOfInterest: 'Yes', displayString: 'TV' },
      SchCVD017b: { valueOfInterest: 'Yes', displayString: 'Radio' },
      SchCVD017c: { valueOfInterest: 'Yes', displayString: 'Online (Facebook, YouTube, etc.)' },
    },
  },
];

const createSingleElementSubDataBuilderConfig = (dataElement, schoolType) => ({
  dataBuilder: 'countByAllDataValues',
  dataBuilderConfig: {
    dataElementCodes: [dataElement],
    convertToPercentage: true,
    entityAggregation: {
      dataSourceEntityType: 'school',
    },
    dataSourceEntityFilter: {
      attributes: {
        type: schoolType,
      },
    },
  },
});

const createMultipleElementSubDataBuilderConfig = (dataElementToString, schoolType) => ({
  dataBuilder: 'countMeasureValues',
  dataBuilderConfig: {
    measureBuilder: 'groupData',
    measureBuilderConfig: {
      groups: {
        Multiple: {
          value: '__',
          operator: 'regex',
        },
        // if it doesn't match one of the groups, it will default to the original value
      },
      measureBuilder: 'getStringsFromBinaryData',
      measureBuilderConfig: {
        entityAggregation: {
          dataSourceEntityType: 'school',
        },
        dataSourceEntityFilter: {
          attributes: {
            type: schoolType,
          },
        },
        delimiter: '__', // Because there is a ', ' in 'Online (Facebook, YouTube, etc.)'
        dataElementToString,
      },
    },
    convertToPercentage: true,
  },
});

const createDataBuilderConfig = (dataElement, dataElementToString) => ({
  dataBuilders: {
    [PRE_SCHOOL]: {
      ...(dataElementToString
        ? createMultipleElementSubDataBuilderConfig(dataElementToString, PRE_SCHOOL)
        : createSingleElementSubDataBuilderConfig(dataElement, PRE_SCHOOL)),
      sortOrder: 1,
    },
    [PRIMARY_SCHOOL]: {
      ...(dataElementToString
        ? createMultipleElementSubDataBuilderConfig(dataElementToString, PRIMARY_SCHOOL)
        : createSingleElementSubDataBuilderConfig(dataElement, PRIMARY_SCHOOL)),
      sortOrder: 2,
    },
    [SECONDARY_SCHOOL]: {
      ...(dataElementToString
        ? createMultipleElementSubDataBuilderConfig(dataElementToString, SECONDARY_SCHOOL)
        : createSingleElementSubDataBuilderConfig(dataElement, SECONDARY_SCHOOL)),
      sortOrder: 3,
    },
  },
});

const createViewJson = name => ({
  name,
  description:
    'This report is calculated based on the number of ‘School COVID-19 Response Laos’ survey responses',
  type: 'chart',
  chartType: 'bar',
  valueType: 'percentage',
  chartConfig: {
    $all: {
      stackId: 1,
    },
  },
  renderLegendForOneItem: true,
  presentationOptions: { hideAverage: true },
});

const createReport = (id, name, dataElement, dataElementToString) => ({
  id,
  dataBuilder: 'composeData',
  viewJson: createViewJson(name),
  dataBuilderConfig: createDataBuilderConfig(dataElement, dataElementToString),
});

exports.up = async function (db) {
  return Promise.all(
    REPORTS.map(async ({ id, name, dataElement, dataElementToString }) => {
      const report = createReport(id, name, dataElement, dataElementToString);
      await insertObject(db, 'dashboardReport', report);

      return db.runSql(`
        UPDATE
          "dashboardGroup"
        SET
          "dashboardReports" = "dashboardReports" || '{ ${report.id} }'
        WHERE
          "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
      `);
    }),
  );
};

exports.down = function (db) {
  return Promise.all(
    REPORTS.map(async ({ id }) => {
      return db.runSql(`
      DELETE FROM "dashboardReport" WHERE id = '${id}';
      UPDATE
        "dashboardGroup"
      SET
        "dashboardReports" = array_remove("dashboardReports", '${id}')
      WHERE
        "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
    `);
    }),
  );
};

exports._meta = {
  version: 1,
};
