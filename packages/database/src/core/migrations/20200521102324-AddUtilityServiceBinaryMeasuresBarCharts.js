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
    id: 'LA_Laos_Schools_Service_Availability_Percentage_Preschool',
    name: 'Utility/Service Availability at Pre-Primary School Level',
    schoolType: 'Pre-School',
  },
  {
    id: 'LA_Laos_Schools_Service_Availability_Percentage_Primary',
    name: 'Utility/Service Availability at Primary School Level',
    schoolType: 'Primary',
  },
  {
    id: 'LA_Laos_Schools_Service_Availability_Percentage_Secondary',
    name: 'Utility/Service Availability at Secondary School Level',
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
            'Electricity available in school': {
              numerator: {
                valueOfInterest: 'Yes',
                dataValues: ['SchFF001'],
              },
              denominator: {
                valueOfInterest: '*',
                dataValues: ['SchFF001'],
              },
            },
            'Internet connection available in school': {
              numerator: {
                valueOfInterest: 'Yes',
                dataValues: ['SchFF002'],
              },
              denominator: {
                valueOfInterest: '*',
                dataValues: ['SchFF002'],
              },
            },
            'Functioning water supply': {
              numerator: {
                valueOfInterest: 'Yes',
                dataValues: ['BCD29_event'],
              },
              denominator: {
                valueOfInterest: '*',
                dataValues: ['BCD29_event'],
              },
            },
            'Functioning toilet (vs. unusable)': {
              numerator: {
                valueOfInterest: 'Yes',
                dataValues: ['BCD32_event'],
              },
              denominator: {
                valueOfInterest: '*',
                dataValues: ['BCD32_event'],
              },
            },
            'Hand washing facility available': {
              numerator: {
                valueOfInterest: 'Yes',
                dataValues: ['SchFF004'],
              },
              denominator: {
                valueOfInterest: '*',
                dataValues: ['SchFF004'],
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
