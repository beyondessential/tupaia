import { insertObject, arrayToDbString } from '../utilities';

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

const DASHBOARD_REPORTS = [
  {
    id: 'LA_Laos_Schools_Resources_Percentage_Preschool',
    name: 'Resources/Support Received at Pre-Primary School Level',
    schoolType: 'Pre-School',
  },
  {
    id: 'LA_Laos_Schools_Resources_Percentage_Primary',
    name: 'Resources/Support Received at Primary School Level',
    schoolType: 'Primary',
  },
  {
    id: 'LA_Laos_Schools_Resources_Percentage_Secondary',
    name: 'Resources/Support Received at Secondary School Level',
    schoolType: 'Secondary',
  },
];

const DASHBOARD_GROUPS = [
  'LA_Laos_Schools_Country_Laos_Schools_User',
  'LA_Laos_Schools_Province_Laos_Schools_User',
  'LA_Laos_Schools_District_Laos_Schools_User',
];

const BASIC_DASHBOARD_REPORT = {
  dataBuilder: 'percentagesOfValueCounts',
};

exports.up = async function (db) {
  await Promise.all(
    DASHBOARD_REPORTS.map((dashboardReport, index) => {
      const { name, id, schoolType } = dashboardReport;
      return insertObject(db, 'dashboardReport', {
        ...BASIC_DASHBOARD_REPORT,
        id,
        dataBuilderConfig: {
          dataClasses: {
            'Hard copy learning materials for communities with limited internet and TV access': {
              numerator: {
                valueOfInterest: 'Yes',
                dataValues: ['SchFF008'],
              },
              denominator: {
                valueOfInterest: '*',
                dataValues: ['SchFF008'],
              },
            },
            'Cleaning/disinfecting materials and guidance on their use': {
              numerator: {
                valueOfInterest: 'Yes',
                dataValues: ['SchFF009'],
              },
              denominator: {
                valueOfInterest: '*',
                dataValues: ['SchFF009'],
              },
            },
            'Hygiene kits': {
              numerator: {
                valueOfInterest: 'Yes',
                dataValues: ['SchFF009a'],
              },
              denominator: {
                valueOfInterest: '*',
                dataValues: ['SchFF009a'],
              },
            },
            'COVID-19 prevention and control training': {
              numerator: {
                valueOfInterest: 'Yes',
                dataValues: ['SchFF010'],
              },
              denominator: {
                valueOfInterest: '*',
                dataValues: ['SchFF010'],
              },
            },
            'Implementing remedial education programmes': {
              numerator: {
                valueOfInterest: 'Yes',
                dataValues: ['SchFF011'],
              },
              denominator: {
                valueOfInterest: '*',
                dataValues: ['SchFF011'],
              },
            },
            'Psychosocial support': {
              numerator: {
                valueOfInterest: 'Yes',
                dataValues: ['SchFF016'],
              },
              denominator: {
                valueOfInterest: '*',
                dataValues: ['SchFF016'],
              },
            },
          },
          dataSourceEntityType: 'school',
          dataSourceEntityFilter: {
            attributes: {
              type: schoolType,
            },
          },
        },
        viewJson: {
          name,
          description:
            'This report is calculated based on the number of School Fundamentals Laos survey responses',
          type: 'chart',
          chartType: 'bar',
          periodGranularity: 'month',
          labelType: 'fractionAndPercentage',
          valueType: 'percentage',
          presentationOptions: {
            hideAverage: true,
          },
        },
      });
    }),
  );

  await db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || array[${arrayToDbString(
      DASHBOARD_REPORTS.map(dash => dash.id),
    )}]
    WHERE code IN (${arrayToDbString(DASHBOARD_GROUPS)});
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id IN (${arrayToDbString(
      DASHBOARD_REPORTS.map(dash => dash.id),
    )});
  `);

  await Promise.all(
    DASHBOARD_REPORTS.map(({ id }) => {
      return db.runSql(`    
        UPDATE "dashboardGroup"
        SET "dashboardReports" = array_remove("dashboardReports", '${id}')
        WHERE code IN (${arrayToDbString(DASHBOARD_GROUPS)});
    `);
    }),
  );
};

exports._meta = {
  version: 1,
};
