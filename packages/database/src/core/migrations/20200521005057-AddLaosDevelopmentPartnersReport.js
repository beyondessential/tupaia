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

const dashboardConfig = {
  cells: [
    [
      'SchDP_finance_AEAL',
      'SchDP_supplies_AEAL',
      'SchDP_materials_AEAL',
      'SchDP_printing_AEAL',
      'SchDP_ta_AEAL',
      'SchDP_training_AEAL',
    ],
    [
      'SchDP_finance_CRS',
      'SchDP_supplies_CRS',
      'SchDP_materials_CRS',
      'SchDP_printing_CRS',
      'SchDP_ta_CRS',
      'SchDP_training_CRS',
    ],
    [
      'SchDP_finance_HI',
      'SchDP_supplies_HI',
      'SchDP_materials_HI',
      'SchDP_printing_HI',
      'SchDP_ta_HI',
      'SchDP_training_HI',
    ],
    [
      'SchDP_finance_PI',
      'SchDP_supplies_PI',
      'SchDP_materials_PI',
      'SchDP_printing_PI',
      'SchDP_ta_PI',
      'SchDP_training_PI',
    ],
    [
      'SchDP_finance_RTR',
      'SchDP_supplies_RTR',
      'SchDP_materials_RTR',
      'SchDP_printing_RTR',
      'SchDP_ta_RTR',
      'SchDP_training_RTR',
    ],
    [
      'SchDP_finance_UNICEF',
      'SchDP_supplies_UNICEF',
      'SchDP_materials_UNICEF',
      'SchDP_printing_UNICEF',
      'SchDP_ta_UNICEF',
      'SchDP_training_UNICEF',
    ],
    [
      'SchDP_finance_WB',
      'SchDP_supplies_WB',
      'SchDP_materials_WB',
      'SchDP_printing_WB',
      'SchDP_ta_WB',
      'SchDP_training_WB',
    ],
    [
      'SchDP_finance_WCL',
      'SchDP_supplies_WCL',
      'SchDP_materials_WCL',
      'SchDP_printing_WCL',
      'SchDP_ta_WCL',
      'SchDP_training_WCL',
    ],
    [
      'SchDP_finance_WFP',
      'SchDP_supplies_WFP',
      'SchDP_materials_WFP',
      'SchDP_printing_WFP',
      'SchDP_ta_WFP',
      'SchDP_training_WFP',
    ],
    [
      'SchDP_finance_WR',
      'SchDP_supplies_WR',
      'SchDP_materials_WR',
      'SchDP_printing_WR',
      'SchDP_ta_WR',
      'SchDP_training_WR',
    ],
    [
      'SchDP_finance_WV',
      'SchDP_supplies_WV',
      'SchDP_materials_WV',
      'SchDP_printing_WV',
      'SchDP_ta_WV',
      'SchDP_training_WV',
    ],
  ],
  dataSourceEntityType: 'country',
  rows: [
    {
      rows: [
        {
          name: 'Aide et Action Laos (AEAL)',
          descriptionDataElement: 'SchDP_projdesc_AEAL',
          code: 'SchDP_AEAL',
        },
        {
          name: 'Catholic Relief Services (CRS)',
          descriptionDataElement: 'SchDP_projdesc_CRS',
          code: 'SchDP_CRS',
        },
        {
          name: 'Humanity & Inclusion - Handicap International',
          descriptionDataElement: 'SchDP_projdesc_HI',
          code: 'SchDP_HII',
        },
        {
          name: 'Plan International',
          descriptionDataElement: 'SchDP_projdesc_PI',
          code: 'SchDP_Plan',
        },
        {
          name: 'Room to Read',
          descriptionDataElement: 'SchDP_projdesc_RTR',
          code: 'SchDP_RtR',
        },
        {
          name: 'UNICEF',
          descriptionDataElement: 'SchDP_projdesc_UNICEF',
          code: 'SchDP_UNICEF',
        },
        {
          name: 'World Bank',
          descriptionDataElement: 'SchDP_projdesc_WB',
          code: 'SchDP_WB',
        },
        {
          name: 'World Concern Laos',
          descriptionDataElement: 'SchDP_projdesc_WCL',
          code: 'SchDP_WC',
        },
        {
          name: 'World Food Programme (WFP)',
          descriptionDataElement: 'SchDP_projdesc_WFP',
          code: 'SchDP_WFP',
        },
        {
          name: 'World Renew',
          descriptionDataElement: 'SchDP_projdesc_WR',
          code: 'SchDP_WR',
        },
        {
          name: 'World Vision',
          descriptionDataElement: 'SchDP_projdesc_WV',
          code: 'SchDP_WV',
        },
      ],
      category: 'Development Partners',
    },
  ],
  columns: [
    'Financial support',
    'Supplies for distribution',
    'Development of Learning materials',
    'Printing and distribution of learning materials',
    'Technical advisory services',
    'Training',
  ],
  rowDataSourceEntityType: 'school',
};

exports.up = function (db) {
  return db.runSql(`
    insert into "dashboardReport" ("id","dataBuilder","dataBuilderConfig","viewJson")
    values (
      'SchDP_Partner_Assistance_Types',
      'tableOfDataValues',
      '${JSON.stringify(dashboardConfig)}',
      '{
        "name": "Type of Assistance for Emergency Response Provided by Development Partners",
        "type": "matrix",
        "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
        "presentationOptions" : {
          "Yes" : {
            "color" : "#279A63",
            "label" : "Project description: ",
            "description" : "$rowInfo"
          },
          "No" : {
            "color" : "#525258",
            "label" : "Project description: ",
            "description" : "$rowInfo"
          }
        }
      }
      '
    );

    update "dashboardGroup"
    set "dashboardReports" = "dashboardReports" || '{"SchDP_Partner_Assistance_Types"}'
    where code in ('LA_Laos_Schools_Province_Laos_Schools_User', 'LA_Laos_Schools_District_Laos_Schools_User', 'LA_Laos_Schools_Country_Laos_Schools_User');
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "dashboardGroup"
    set "dashboardReports" = array_remove("dashboardReports", 'SchDP_Partner_Assistance_Types')
    where code in ('LA_Laos_Schools_Province_Laos_Schools_User', 'LA_Laos_Schools_District_Laos_Schools_User', 'LA_Laos_Schools_Country_Laos_Schools_User');
      
    delete from "dashboardReport" where id = 'SchDP_Partner_Assistance_Types';
  `);
};

exports._meta = {
  version: 1,
};
