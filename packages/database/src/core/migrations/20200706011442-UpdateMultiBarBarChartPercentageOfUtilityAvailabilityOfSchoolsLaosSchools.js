'use strict';

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
    schoolType: 'Pre-School',
  },
  {
    id: 'LA_Laos_Schools_Service_Availability_Percentage_Primary',
    schoolType: 'Primary',
  },
  {
    id: 'LA_Laos_Schools_Service_Availability_Percentage_Secondary',
    schoolType: 'Secondary',
  },
];

const OLD_DATA_BUILDER_CONFIG = {
  dataClasses: {
    'Functioning water supply': {
      numerator: {
        dataValues: ['BCD29_event'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['BCD29_event'],
        valueOfInterest: '*',
      },
    },
    'Electricity available in school': {
      numerator: {
        dataValues: ['SchFF001'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchFF001'],
        valueOfInterest: '*',
      },
    },
    'Hand washing facility available': {
      numerator: {
        dataValues: ['SchFF004'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchFF004'],
        valueOfInterest: '*',
      },
    },
    'Functioning toilet (vs. unusable)': {
      numerator: {
        dataValues: ['BCD32_event'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['BCD32_event'],
        valueOfInterest: '*',
      },
    },
    'Internet connection available in school': {
      numerator: {
        dataValues: ['SchFF002'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchFF002'],
        valueOfInterest: '*',
      },
    },
  },
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const NEW_DATA_BUILDER_CONFIG = {
  dataClasses: {
    // Update heading
    'Access to clean water': {
      numerator: {
        dataValues: ['BCD29_event'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['BCD29_event'],
        valueOfInterest: '*',
      },
    },
    // Keep the same
    'Electricity available in school': {
      numerator: {
        dataValues: ['SchFF001'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchFF001'],
        valueOfInterest: '*',
      },
    },
    // Update heading
    'Functioning hand washing facilities': {
      numerator: {
        dataValues: ['SchFF004'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchFF004'],
        valueOfInterest: '*',
      },
    },
    // Update heading
    'Functioning toilets': {
      numerator: {
        dataValues: ['BCD32_event'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['BCD32_event'],
        valueOfInterest: '*',
      },
    },
    // Update heading
    'Internet connection available': {
      numerator: {
        dataValues: ['SchFF002'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchFF002'],
        valueOfInterest: '*',
      },
    },
    // New data code
    'Functioning water filters': {
      numerator: {
        dataValues: ['SchCVD009'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchCVD009'],
        valueOfInterest: '*',
      },
    },
  },
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const OLD_REPORT_DESCRIPTION =
  'This report is calculated based on the number of School Fundamentals Laos survey responses';

const NEW_REPORT_DESCRIPTION =
  "This report is calculated based on the number of \\'School COVID-19 Response Laos\\' survey responses";

exports.up = async function (db) {
  await Promise.all(
    DASHBOARD_REPORTS.map(dashboardReport => {
      const { id, schoolType } = dashboardReport;
      const dataBuilderConfig = {
        ...NEW_DATA_BUILDER_CONFIG,
        dataSourceEntityFilter: {
          attributes: {
            type: schoolType,
          },
        },
      };

      return db.runSql(`
        UPDATE "dashboardReport"
        SET "dataBuilderConfig" = '${JSON.stringify(dataBuilderConfig)}',
        "viewJson" = jsonb_set("viewJson", '{description}', E'"${NEW_REPORT_DESCRIPTION}"')
        WHERE id = '${id}';
    `);
    }),
  );
};

exports.down = async function (db) {
  await Promise.all(
    DASHBOARD_REPORTS.map(dashboardReport => {
      const { id, schoolType } = dashboardReport;
      const dataBuilderConfig = {
        ...OLD_DATA_BUILDER_CONFIG,
        dataSourceEntityFilter: {
          attributes: {
            type: schoolType,
          },
        },
      };

      return db.runSql(`
        UPDATE "dashboardReport"
        SET "dataBuilderConfig" = '${JSON.stringify(dataBuilderConfig)}',
        "viewJson" = jsonb_set("viewJson", '{description}', '"${OLD_REPORT_DESCRIPTION}"')
        WHERE id = '${id}';
    `);
    }),
  );
};

exports._meta = {
  version: 1,
};
