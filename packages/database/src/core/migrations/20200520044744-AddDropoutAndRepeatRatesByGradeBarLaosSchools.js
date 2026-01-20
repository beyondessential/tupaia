'use strict';

import { insertObject } from '../utilities/migration';
import { arrayToDbString } from '../utilities';

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

const PROVINCE_GROUP_CODES = ['LA_Laos_Schools_Province_Laos_Schools_User'];
const DISTRICT_GROUP_CODES = ['LA_Laos_Schools_District_Laos_Schools_User'];

const GRADE_NAMES = {
  PRIMARY: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Total'],
  LOWER_SECONDARY: ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Total'],
  UPPER_SECONDARY: ['Grade 10', 'Grade 11', 'Grade 12', 'Total'],
};

const BASE_REPORT = {
  dataBuilder: 'composeData',
  dataServices: [{ isDataRegional: true }],
};

const BASE_VIEW_JSON = {
  valueType: 'percentage',
  type: 'chart',
  chartType: 'bar',
  chartConfig: {
    Female: {
      legendOrder: 1,
    },
    Male: {
      legendOrder: 2,
    },
    Total: {
      legendOrder: 3,
    },
  },
  periodGranularity: 'one_year_at_a_time',
};

const REPORTS = {
  Laos_Schools_Dropout_Bar_Primary: {
    name: 'Drop-out Rate in Primary Education (%)',
    gradeNames: GRADE_NAMES.PRIMARY,
    codeIndexOffset: 1, // code of first bit of data
    codePrefix: 'SchDrop',
  },
  Laos_Schools_Dropout_Bar_Lower_Secondary: {
    name: 'Drop-out Rate in Lower Secondary Education (%)',
    gradeNames: GRADE_NAMES.LOWER_SECONDARY,
    codeIndexOffset: 19,
    codePrefix: 'SchDrop',
  },
  Laos_Schools_Dropout_Bar_Upper_Secondary: {
    name: 'Drop-out Rate in Upper Secondary Education (%)',
    gradeNames: GRADE_NAMES.UPPER_SECONDARY,
    codeIndexOffset: 34,
    codePrefix: 'SchDrop',
  },
  Laos_Schools_Repeaters_Bar_Primary: {
    name: 'Repeat Rate in Primary Education (%)',
    gradeNames: GRADE_NAMES.PRIMARY,
    codeIndexOffset: 1,
    codePrefix: 'SchRep',
  },
  Laos_Schools_Repeaters_Bar_Lower_Secondary: {
    name: 'Repeat Rate in Lower Secondary Education (%)',
    gradeNames: GRADE_NAMES.LOWER_SECONDARY,
    codeIndexOffset: 19,
    codePrefix: 'SchRep',
  },
  Laos_Schools_Repeaters_Bar_Upper_Secondary: {
    name: 'Repeat Rate in Upper Secondary Education (%)',
    gradeNames: GRADE_NAMES.UPPER_SECONDARY,
    codeIndexOffset: 34,
    codePrefix: 'SchRep',
  },
};

exports.up = async function (db) {
  await Promise.all(
    // Does the whole inner loop twice, once for each level
    [true, false].map(isProvinceLevel =>
      Object.entries(REPORTS).map(([baseReportId, reportConfig]) => {
        const { name, gradeNames, codeIndexOffset } = reportConfig;

        const dataBuilders = {};
        gradeNames.forEach((gradeName, gradeIndex) => {
          const baseCodeIndex = gradeIndex * 3;
          // Important the codes are in order of gender (Total, Female, Male)
          const codes = [...Array(3).keys()].map(
            int =>
              `SchDrop${isProvinceLevel ? 'Prov' : ''}${(codeIndexOffset + baseCodeIndex + int)
                .toString()
                .padStart(3, '0')}`,
          );
          dataBuilders[gradeName] = {
            sortOrder: gradeIndex,
            dataBuilder: 'sumLatestPerMetric',
            dataBuilderConfig: {
              labels: {
                [codes[0]]: 'Total',
                [codes[1]]: 'Female',
                [codes[2]]: 'Male',
              },
              dataElementCodes: codes,
              dataSourceEntityType: isProvinceLevel ? 'district' : 'sub_district',
              aggregationEntityType: isProvinceLevel ? 'district' : 'sub_district',
            },
          };
        });
        const id = `${baseReportId}${isProvinceLevel ? '_Province' : '_District'}`;
        const report = {
          ...BASE_REPORT,
          id,
          viewJson: { ...BASE_VIEW_JSON, name },
          dataBuilderConfig: {
            dataBuilders,
          },
        };
        return Promise.all([
          insertObject(db, 'dashboardReport', report),
          db.runSql(`
            UPDATE
              "dashboardGroup"
            SET
              "dashboardReports" = "dashboardReports" || '{ ${id} }'
            WHERE
              "code" in (${arrayToDbString(
                isProvinceLevel ? PROVINCE_GROUP_CODES : DISTRICT_GROUP_CODES,
              )});
          `),
        ]);
      }),
    ),
  );
};

exports.down = async function (db) {
  return Promise.all(
    [true, false].map(isProvinceLevel =>
      Object.entries(REPORTS).map(([baseReportId, _]) => {
        const id = `${baseReportId}${isProvinceLevel ? '_Province' : '_District'}`;
        return db.runSql(`
          DELETE FROM "dashboardReport" WHERE id = '${id}';
    
          UPDATE
            "dashboardGroup"
          SET
            "dashboardReports" = array_remove("dashboardReports", '${id}')
          WHERE
            "code" in (${arrayToDbString(
              isProvinceLevel ? PROVINCE_GROUP_CODES : DISTRICT_GROUP_CODES,
            )});
        `);
      }),
    ),
  );
};

exports._meta = {
  version: 1,
};
