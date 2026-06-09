'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const REPORTS_WITH_ONE_SCHOOL_KEY = [
  'LAOS_SCHOOL_BINARY_TABLE',
  'Laos_Schools_Male_Female',
  'Laos_Schools_Language_Of_Students',
  'LA_Laos_Schools_Service_Availability_Percentage_Preschool',
  'LA_Laos_Schools_Service_Availability_Percentage_Primary',
  'LA_Laos_Schools_Service_Availability_Percentage_Secondary',
  'LA_Laos_Schools_Resources_Percentage_Preschool',
  'LA_Laos_Schools_Resources_Percentage_Primary',
  'LA_Laos_Schools_Resources_Percentage_Secondary',
  'SchDP_Partner_Assistance_Types',
];
const REPORTS_WITH_MULTIPLE_DATABUILDERS = [
  'Laos_Schools_Dropout_Bar_Primary_District',
  'Laos_Schools_Dropout_Bar_Primary_Province',
  'Laos_Schools_Repeaters_Bar_Primary_Province',
  'Laos_Schools_Repeaters_Bar_Lower_Secondary_Province',
  'Laos_Schools_Repeaters_Bar_Upper_Secondary_Province',
  'Laos_Schools_Dropout_Bar_Lower_Secondary_District',
  'Laos_Schools_Dropout_Bar_Upper_Secondary_District',
  'Laos_Schools_Repeaters_Bar_Primary_District',
  'Laos_Schools_Repeaters_Bar_Lower_Secondary_District',
  'Laos_Schools_Repeaters_Bar_Upper_Secondary_District',
  'Laos_Schools_Dropout_Bar_Upper_Secondary_Province',
  'Laos_Schools_Dropout_Bar_Lower_Secondary_Province',
  'Laos_Schools_MoES_Users_Percent_School',
  'Laos_Schools_Primary_Standardised_Tests_School',
];

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return Promise.all([
    ...REPORTS_WITH_ONE_SCHOOL_KEY.map(id =>
      db.runSql(`
        update "dashboardReport"
        set "dataBuilderConfig" = "dataBuilderConfig" - 'dataSourceEntityType'
        where id='${id}';

        update "dashboardReport"
        set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{entityAggregation}', '{"dataSourceEntityType": "school"}'::jsonb)
        where id='${id}';
      `),
    ),
    ...REPORTS_WITH_MULTIPLE_DATABUILDERS.map(async id => {
      const { rows } = await db.runSql(`select * from "dashboardReport" where id='${id}'`);
      if (rows.length !== 1) return null;
      const { dataBuilderConfig: reportConfig } = rows[0];
      // Top level
      if (reportConfig.dataSourceEntityType) {
        await db.runSql(`
          update "dashboardReport"
          set "dataBuilderConfig" = "dataBuilderConfig" - 'dataSourceEntityType'
          where id='${id}';

          update "dashboardReport"
          set "dataBuilderConfig" = "dataBuilderConfig" - 'aggregationEntityType'
          where id='${id}';

          update "dashboardReport"
          set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{entityAggregation}', '{"dataSourceEntityType": "${reportConfig.dataSourceEntityType}"}'::jsonb)
          where id='${id}';
        `);
      }
      // Nested
      return Promise.all(
        Object.entries(reportConfig.dataBuilders).map(([code, { dataBuilderConfig }]) => {
          const configPath = `dataBuilders,${code},dataBuilderConfig,`;
          return db.runSql(`
            update "dashboardReport"
            set "dataBuilderConfig" = "dataBuilderConfig" #- '{${configPath}dataSourceEntityType}'
            where id='${id}';

            update "dashboardReport"
            set "dataBuilderConfig" = "dataBuilderConfig" #- '{${configPath}aggregationEntityType}'
            where id='${id}';

            update "dashboardReport"
            set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{${configPath}entityAggregation}', '{"dataSourceEntityType": "${dataBuilderConfig.dataSourceEntityType}"}'::jsonb)
            where id='${id}';
          `);
        }),
      );
    }),
  ]);
};

exports.down = function (db) {
  return Promise.all([
    ...REPORTS_WITH_ONE_SCHOOL_KEY.map(id =>
      db.runSql(`
      update "dashboardReport"
      set "dataBuilderConfig" = "dataBuilderConfig" - 'entityAggregation'
      where id='${id}';

      update "dashboardReport"
      set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{dataSourceEntityType}', '"school"')
      where id='${id}';
      `),
    ),
    ...REPORTS_WITH_MULTIPLE_DATABUILDERS.map(async id => {
      const { rows } = await db.runSql(`select * from "dashboardReport" where id='${id}'`);
      if (rows.length !== 1) return null;
      const { dataBuilderConfig } = rows[0];
      // Top level
      if (reportConfig.entityAggregation) {
        await db.runSql(`
          update "dashboardReport"
          set "dataBuilderConfig" = "dataBuilderConfig" - 'entityAggregation'
          where id='${id}';

          update "dashboardReport"
          set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{dataSourceEntityType}', '"${reportConfig.dataSourceEntityType}"')
          where id='${id}';

          update "dashboardReport"
          set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{aggregationEntityType}', '"${reportConfig.dataSourceEntityType}"')
          where id='${id}';
        `);
      }
      // Nested
      return Promise.all(
        Object.entries(reportConfig.dataBuilders).map(([code, { dataBuilderConfig }]) => {
          const configPath = `dataBuilders,${code},dataBuilderConfig,`;
          return db.runSql(`
            update "dashboardReport"
            set "dataBuilderConfig" = "dataBuilderConfig" #- '{${configPath}entityAggregation}'
            where id='${id}';

            update "dashboardReport"
            set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{${configPath}dataSourceEntityType}', '"${dataBuilderConfig.entityAggregation.dataSourceEntityType}"')
            where id='${id}';

            update "dashboardReport"
            set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{${configPath}aggregationEntityType}', '"${dataBuilderConfig.entityAggregation.dataSourceEntityType}"')
            where id='${id}';
          `);
        }),
      );
    }),
  ]);
};

exports._meta = {
  version: 1,
};
