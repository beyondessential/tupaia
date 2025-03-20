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
    chartConfigConfig: [
      // Order important here
      { name: 'Distance to grid under 0.5km' },
      { name: 'Distance to grid 0.5 to 1km' },
      { name: 'Distance to grid 1 to 2km' },
      { name: 'Distance to grid 2 to 4km' },
      { name: 'Distance to grid over 5km' },
    ],
  },
  {
    id: 'Laos_Schools_Age_Of_Computers_By_School_Type',
    name: 'Age of Functioning Computers, % of Schools',
    dataElement: 'SchCVD014',
    chartConfigConfig: [
      // Order important here
      { name: 'Provided less than 1 year ago' },
      { name: 'Provided less than 2 years ago' },
      { name: 'Provided less than 3 years ago' },
      { name: 'Provided over 4 years ago' },
    ],
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
      SchCVD010a: 'Tap water',
      SchCVD010b: 'Borehole',
      SchCVD010c: 'Well',
      SchCVD010d: 'Spring water (gravity-fed system)',
      SchCVD010e: 'River/stream',
      SchCVD010f: 'Pond',
      SchCVD010g: 'Reservoir',
      SchCVD010i: 'Rainwater harvesting',
      SchCVD010h: 'Other',
    },
    chartConfigConfig: [
      // Order important here
      { name: 'Tap water' },
      { name: 'Borehole' },
      { name: 'Spring water (gravity-fed system)' },
      { name: 'Pond' },
      { name: 'River/stream' },
      { name: 'Reservoir' },
      { name: 'Well' },
      { name: 'Rainwater harvesting' },
      { name: 'Other' },
      { name: 'Multiple' },
    ],
  },
  {
    // This one too
    id: 'Laos_Schools_Teachers_Following_MoES_By_School_Type',
    name: 'Teachers Following MoES Programmes at Home, % of Schools',
    dataElementToString: {
      SchCVD016a: 'TV',
      SchCVD016b: 'Radio',
      SchCVD016c: 'Online (Facebook, YouTube, etc.)',
    },
  },
  {
    // This one too
    id: 'Laos_Schools_Students_Following_MoES_By_School_Type',
    name: 'Students Following MoES Programmes at Home, % of Schools',
    dataElementToString: {
      SchCVD017a: 'TV',
      SchCVD017b: 'Radio',
      SchCVD017c: 'Online (Facebook, YouTube, etc.)',
    },
  },
];

const createDataClassesFromDataElementToString = dataElementToString => {
  const dataClasses = {};
  Object.values(dataElementToString).forEach(string => {
    dataClasses[string] = {
      value: string,
      operator: '=',
    };
  });
  return dataClasses;
};

const createSingleElementSubDataBuilderConfig = (dataElement, schoolType) => ({
  dataBuilder: 'countByLatestDataValues',
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
  dataBuilder: 'countCalculatedValuesPerOrgUnit',
  dataBuilderConfig: {
    operation: {
      operator: 'COMBINE_BINARY_AS_STRING',
      delimiter: '__', // Because there is a ', ' in 'Online (Facebook, YouTube, etc.)'
      dataElementToString,
    },
    dataClasses: {
      Multiple: {
        value: '__', // multiple indicators
        operator: 'regex',
      },
      ...createDataClassesFromDataElementToString(dataElementToString),
    },
    entityAggregation: {
      dataSourceEntityType: 'school',
    },
    dataSourceEntityFilter: {
      attributes: {
        type: schoolType,
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
  fillWithNoData: true,
});

const createChartConfig = (chartConfigConfig = []) => {
  const chartConfig = {
    $all: {
      stackId: 1,
    },
  };

  chartConfigConfig.forEach(({ name, color }, index) => {
    chartConfig[name] = {
      legendOrder: index,
    };
    if (color) {
      chartConfig[name].color = color;
    }
  });

  return chartConfig;
};

const createViewJson = (name, chartConfigConfig) => ({
  name,
  description:
    'This report is calculated based on the number of ‘School COVID-19 Response Laos’ survey responses',
  type: 'chart',
  chartType: 'bar',
  valueType: 'percentage',
  chartConfig: createChartConfig(chartConfigConfig),
  renderLegendForOneItem: true,
  presentationOptions: { hideAverage: true },
});

const createReport = ({ id, name, chartConfigConfig, dataElement, dataElementToString }) => ({
  id,
  dataBuilder: 'composeData',
  viewJson: createViewJson(name, chartConfigConfig),
  dataBuilderConfig: createDataBuilderConfig(dataElement, dataElementToString),
});

exports.up = async function (db) {
  return Promise.all(
    REPORTS.map(async reportConfig => {
      const report = createReport(reportConfig);
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
