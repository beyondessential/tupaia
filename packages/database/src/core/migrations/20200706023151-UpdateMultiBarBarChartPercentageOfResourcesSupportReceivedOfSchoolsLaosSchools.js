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
    id: 'LA_Laos_Schools_Resources_Percentage_Preschool',
    schoolType: 'Pre-School',
  },
  {
    id: 'LA_Laos_Schools_Resources_Percentage_Primary',
    schoolType: 'Primary',
  },
  {
    id: 'LA_Laos_Schools_Resources_Percentage_Secondary',
    schoolType: 'Secondary',
  },
];

const OLD_DATA_BUILDER_CONFIG = {
  dataClasses: {
    // Remove
    'Hygiene kits': {
      numerator: {
        dataValues: ['SchFF009a'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchFF009a'],
        valueOfInterest: '*',
      },
    },
    // Remove
    'Psychosocial support': {
      numerator: {
        dataValues: ['SchFF016'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchFF016'],
        valueOfInterest: '*',
      },
    },
    // Remove
    'COVID-19 prevention and control training': {
      numerator: {
        dataValues: ['SchFF010'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchFF010'],
        valueOfInterest: '*',
      },
    },
    // Will be updated
    'Implementing remedial education programmes': {
      numerator: {
        dataValues: ['SchFF011'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchFF011'],
        valueOfInterest: '*',
      },
    },
    // Remove
    'Cleaning/disinfecting materials and guidance on their use': {
      numerator: {
        dataValues: ['SchFF009'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchFF009'],
        valueOfInterest: '*',
      },
    },
    // Remove
    'Hard copy learning materials for communities with limited internet and TV access': {
      numerator: {
        dataValues: ['SchFF008'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchFF008'],
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
    // Update Name
    'Remedial support provided to students': {
      numerator: {
        dataValues: ['SchFF011'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchFF011'],
        valueOfInterest: '*',
      },
    },
    // New data element code
    'Textbooks and additional learning material received': {
      numerator: {
        dataValues: ['SchCVD004'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchCVD004'],
        valueOfInterest: '*',
      },
    },
    // New data element code
    'Students have their own textbooks': {
      numerator: {
        dataValues: ['SchCVD005'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchCVD005'],
        valueOfInterest: '*',
      },
    },
    // New data element code
    'COVID-19 posters and materials received': {
      numerator: {
        dataValues: ['SchCVD006'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchCVD006'],
        valueOfInterest: '*',
      },
    },
    // New data element code
    'Thermometer(s) received for taking temperature': {
      numerator: {
        dataValues: ['SchCVD024'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchCVD024'],
        valueOfInterest: '*',
      },
    },
    // New data element code
    'Hygiene promotion training in last 3 years': {
      numerator: {
        dataValues: ['SchCVD007'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchCVD007'],
        valueOfInterest: '*',
      },
    },
    // New data element code
    'Functioning TV, satellite receiver and dish set': {
      numerator: {
        dataValues: ['SchCVD012'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchCVD012'],
        valueOfInterest: '*',
      },
    },
    // New data element code
    'Functioning notebook/laptop or desktop computer': {
      numerator: {
        dataValues: ['SchCVD013'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchCVD013'],
        valueOfInterest: '*',
      },
    },
    // New data element code
    'Functioning projector': {
      numerator: {
        dataValues: ['SchCVD015'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchCVD015'],
        valueOfInterest: '*',
      },
    },
    // New data element code
    'Teachers follow the MoES education shows on TV': {
      numerator: {
        dataValues: ['SchCVD016'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchCVD016'],
        valueOfInterest: '*',
      },
    },
    // New data element code
    'Students follow the MoES education shows on TV': {
      numerator: {
        dataValues: ['SchCVD017'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchCVD017'],
        valueOfInterest: '*',
      },
    },
    // New data element code
    'Teachers using resources on MoES website': {
      numerator: {
        dataValues: ['SchCVD018'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchCVD018'],
        valueOfInterest: '*',
      },
    },
    // New data element code
    'Training on digital literacy and MoES website resources received': {
      numerator: {
        dataValues: ['SchCVD019'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchCVD019'],
        valueOfInterest: '*',
      },
    },
    // New data element code
    'Support implementing catch-up/remedial teaching programmes received': {
      numerator: {
        dataValues: ['SchCVD020'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchCVD020'],
        valueOfInterest: '*',
      },
    },
    // New data element code
    'Students require psychosocial support': {
      numerator: {
        dataValues: ['SchCVD021'],
        valueOfInterest: 'Yes',
      },
      denominator: {
        dataValues: ['SchCVD021'],
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
