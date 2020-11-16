'use strict';

import { arrayToDbString, insertObject } from '../utilities/migration';

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

const DASHBOARD_GROUP_CODES = [
  'LA_Laos_Schools_District_Laos_Schools_User',
  'LA_Laos_Schools_Province_Laos_Schools_User',
  'LA_Laos_Schools_Country_Laos_Schools_User',
];

const GRADE_1 = 'Grade 1';
const GRADE_2 = 'Grade 2';
const GRADE_3 = 'Grade 3';
const GRADE_4 = 'Grade 4';
const GRADE_5 = 'Grade 5';

const GRADE_6 = 'Grade 6';
const GRADE_7 = 'Grade 7';
const GRADE_8 = 'Grade 8';
const GRADE_9 = 'Grade 9';

const GRADE_10 = 'Grade 10';
const GRADE_11 = 'Grade 11';
const GRADE_12 = 'Grade 12';

const REPORTS = [
  {
    // Primary school
    id: 'Laos_Schools_Textbook_student_Ratio_By_Grade_Primary_Bar',
    name: 'Primary Textbook-Student Ratio',
    populationCodes: {
      [GRADE_1]: ['SchPop011', 'SchPop012'],
      [GRADE_2]: ['SchPop013', 'SchPop014'],
      [GRADE_3]: ['SchPop015', 'SchPop016'],
      [GRADE_4]: ['SchPop017', 'SchPop018'],
      [GRADE_5]: ['SchPop019', 'SchPop020'],
    },
    textbookCodes: {
      'Lao Language': {
        [GRADE_1]: ['STCL001'],
        [GRADE_2]: ['STCL020'],
        [GRADE_3]: ['STCL039'],
        [GRADE_4]: ['STCL058'],
        [GRADE_5]: ['STCL077'],
      },
      Mathematics: {
        [GRADE_1]: ['STCL002'],
        [GRADE_2]: ['STCL021'],
        [GRADE_3]: ['STCL040'],
        [GRADE_4]: ['STCL059'],
        [GRADE_5]: ['STCL078'],
      },
      'World Around Us': {
        [GRADE_1]: ['STCL003'],
        [GRADE_2]: ['STCL022'],
        [GRADE_3]: ['STCL041'],
        [GRADE_4]: ['STCL060'],
        [GRADE_5]: ['STCL079'],
      },
    },
  },
  {
    // Secondary (lower)
    id: 'Laos_Schools_Textbook_student_Ratio_By_Grade_Lower_Secondary_Bar',
    name: 'Lower Secondary Textbook-Student Ratio',
    populationCodes: {
      [GRADE_6]: ['SchPop021', 'SchPop022'],
      [GRADE_7]: ['SchPop023', 'SchPop024'],
      [GRADE_8]: ['SchPop025', 'SchPop026'],
      [GRADE_9]: ['SchPop027', 'SchPop028'],
    },
    textbookCodes: {
      'Lao Language': {
        [GRADE_6]: ['STCL004'],
        [GRADE_7]: ['STCL023'],
        [GRADE_8]: ['STCL042'],
        [GRADE_9]: ['STCL061'],
      },
      Mathematics: {
        [GRADE_6]: ['STCL005'],
        [GRADE_7]: ['STCL024'],
        [GRADE_8]: ['STCL043'],
        [GRADE_9]: ['STCL062'],
      },
      'Natural Science': {
        [GRADE_6]: ['STCL006'],
        [GRADE_7]: ['STCL025'],
        [GRADE_8]: ['STCL044'],
        [GRADE_9]: ['STCL063'],
      },
      'Political Science': {
        [GRADE_6]: ['STCL007'],
        [GRADE_7]: ['STCL026'],
        [GRADE_8]: ['STCL045'],
        [GRADE_9]: ['STCL064'],
      },
      ICT: {
        [GRADE_6]: ['STCL008'],
        [GRADE_7]: ['STCL027'],
        [GRADE_8]: ['STCL046'],
        [GRADE_9]: ['STCL065'],
      },
      English: {
        [GRADE_6]: ['STCL009'],
        [GRADE_7]: ['STCL028'],
        [GRADE_8]: ['STCL047'],
        [GRADE_9]: ['STCL066'],
      },
      French: {
        [GRADE_6]: ['STCL010'],
        [GRADE_7]: ['STCL029'],
        [GRADE_8]: ['STCL048'],
        [GRADE_9]: ['STCL067'],
      },
      'Mathematics Exercise Book': {
        [GRADE_6]: ['STCL011'],
        [GRADE_7]: ['STCL030'],
        [GRADE_8]: ['STCL049'],
        [GRADE_9]: ['STCL068'],
      },
    },
  },
  {
    id: 'Laos_Schools_Textbook_student_Ratio_By_Grade_Upper_Secondary_Bar',
    name: 'Upper Secondary Textbook-Student Ratio',
    populationCodes: {
      [GRADE_10]: ['SchPop029', 'SchPop030'],
      [GRADE_11]: ['SchPop031', 'SchPop032'],
      [GRADE_12]: ['SchPop033', 'SchPop034'],
    },
    textbookCodes: {
      'Lao Language & Literature': {
        [GRADE_10]: ['STCL080'],
        [GRADE_11]: ['STCL096'],
        [GRADE_12]: ['STCL112'],
      },
      Mathematics: {
        [GRADE_10]: ['STCL081'],
        [GRADE_11]: ['STCL097'],
        [GRADE_12]: ['STCL113'],
      },
    },
  },
];

/**
 * Returns a shape like:
 * [LAO_LANGUAGE]: {
 *    [GRADE_1]: {
 *      operator: 'DIVIDE',
 *      operands: [
 *        { dataValues: ['SchPop011', 'SchPop012'] },
 *        { dataValues: ['STCL001'] },
 *      ],
 *    },
 *    ...
 * }
 */
const createSeriesConfig = (populationCodes, textbookCodes) => {
  const seriesConfig = {};
  Object.entries(textbookCodes).forEach(([textbookName, codesByGrade]) =>
    Object.entries(codesByGrade).forEach(([grade, dataElementCodes]) => {
      if (!seriesConfig[textbookName]) seriesConfig[textbookName] = {};
      seriesConfig[textbookName][grade] = {
        operator: 'DIVIDE',
        operands: [{ dataValues: dataElementCodes }, { dataValues: populationCodes[grade] }],
      };
    }),
  );
  return seriesConfig;
};

const createDataBuilderConfig = (populationCodes, textbookCodes) => ({
  series: createSeriesConfig(populationCodes, textbookCodes),
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
});

const createChartConfig = textbookCodes => {
  const chartConfig = {
    $all: {
      yAxisDomain: {
        min: { type: 'number', value: 0 },
        max: { type: 'clamp', max: 2 },
      },
    },
  };
  Object.keys(textbookCodes).forEach((textbookName, index) => {
    chartConfig[textbookName] = { legendOrder: index };
  });
  return chartConfig;
};

const createViewJson = (name, textbookCodes) => ({
  name,
  type: 'chart',
  chartType: 'bar',
  presentationOptions: {
    valueFormat: '0.00',
  },
  valueType: 'number',
  chartConfig: createChartConfig(textbookCodes),
});

const createReport = ({ id, name, populationCodes, textbookCodes }) => ({
  id,
  dataBuilder: 'calcPerSeries',
  dataBuilderConfig: createDataBuilderConfig(populationCodes, textbookCodes),
  viewJson: createViewJson(name, textbookCodes),
});

const addReport = async (db, report) => {
  await insertObject(db, 'dashboardReport', report);

  await db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${report.id} }'
    WHERE
      "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

const deleteReport = async (db, report) => {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${report.id}';
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${report.id}')
    WHERE
      "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports.up = async function (db) {
  for (const report of REPORTS) {
    await addReport(db, createReport(report));
  }
};

exports.down = async function (db) {
  for (const report of REPORTS) {
    await deleteReport(db, report);
  }
};

exports._meta = {
  version: 1,
};
