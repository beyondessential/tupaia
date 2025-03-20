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

const DASHBOARD_GROUP_CODES = [
  'LA_Laos_Schools_Country_Laos_Schools_User',
  'LA_Laos_Schools_Province_Laos_Schools_User',
  'LA_Laos_Schools_District_Laos_Schools_User',
];

const REPORTS = [
  {
    id: 'Laos_Schools_Number_Of_Pre_Schools_Supported_Development_Partners',
    name: 'Number of Pre-Schools Supported by Development Partners',
    schoolType: 'Pre-School',
  },
  {
    id: 'Laos_Schools_Number_Of_Primary_Schools_Supported_Development_Partners',
    name: 'Number of Primary Schools Supported by Development Partners',
    schoolType: 'Primary',
  },
  {
    id: 'Laos_Schools_Number_Of_Secondary_Schools_Supported_Development_Partners',
    name: 'Number of Secondary Schools Supported by Development Partners',
    schoolType: 'Secondary',
  },
];

const BASE_DATA_BUILDER_CONFIG = {
  operation: {
    operator: 'COMBINE_BINARY_AS_STRING',
    dataElementToString: {
      SchCVD022: {
        valueOfInterest: 'No',
        displayString: 'No support',
      },
      SchDP_WB: 'World Bank',
      SchDP_WC: 'World Concern Laos',
      SchDP_WR: 'World Renew',
      SchDP_WV: 'World Vision',
      SchDP_CRS: 'Catholic Relief Services (CRS)',
      SchDP_HII: 'Humanity & Inclusion - Handicap International',
      SchDP_RtR: 'Room to Read',
      SchDP_WFP: 'World Food Programme (WFP)',
      SchCVD022l: 'Other',
      SchDP_AEAL: 'Aide et Action Laos (AEAL)',
      SchDP_Plan: 'Plan International',
      SchDP_UNICEF: 'UNICEF',
    },
  },
  dataClasses: {
    'World Bank': {
      operator: '=',
      value: 'World Bank',
    },
    'World Concern Laos': {
      operator: '=',
      value: 'World Concern Laos',
    },
    'World Renew': {
      operator: '=',
      value: 'World Renew',
    },
    'World Vision': {
      operator: '=',
      value: 'World Vision',
    },
    'Catholic Relief Services (CRS)': {
      operator: '=',
      value: 'Catholic Relief Services (CRS)',
    },
    'Humanity & Inclusion - Handicap International': {
      operator: '=',
      value: 'Humanity & Inclusion - Handicap International',
    },
    'Room to Read': {
      operator: '=',
      value: 'Room to Read',
    },
    'World Food Programme (WFP)': {
      operator: '=',
      value: 'World Food Programme (WFP)',
    },
    'Aide et Action Laos (AEAL)': {
      operator: '=',
      value: 'Aide et Action Laos (AEAL)',
    },
    'Plan International': {
      operator: '=',
      value: 'Plan International',
    },
    UNICEF: {
      operator: '=',
      value: 'UNICEF',
    },
    Other: {
      operator: '=',
      value: 'Other',
    },
    'No support': {
      operator: 'regex',
      value: 'No support',
    },
    Multiple: {
      operator: 'regex',
      value: '^(?=.*,)(?!.*No support).*', // multiple indicators except No support
    },
  },
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const BASE_VIEW_JSON = {
  type: 'chart',
  chartType: 'pie',
  valueType: 'number',
  periodGranularity: 'month',
  presentationOptions: {
    'World Bank': {
      color: '#FC1D26',
    },
    'World Concern Laos': {
      color: '#FD9155',
    },
    'World Renew': {
      color: '#C9811C',
    },
    'World Vision': {
      color: '#FEDD64',
    },
    'Catholic Relief Services (CRS)': {
      color: '#81D75E',
    },
    'Humanity & Inclusion - Handicap International': {
      color: '#0F7F3B',
    },
    'Room to Read': {
      color: '#20C2CA',
    },
    'World Food Programme (WFP)': {
      color: '#40B7FC',
    },
    'Aide et Action Laos (AEAL)': {
      color: '#0A4EAB',
    },
    'Plan International': {
      color: '#8C5AFB',
    },
    UNICEF: {
      color: '#FD6AC4',
    },
    Other: {
      color: '#D9D9D9',
    },
    Multiple: {
      color: '#7B6AFD',
    },
    'No support': {
      color: '#BC6DCB',
    },
  },
};

const addReport = async (db, { id, name, schoolType }) => {
  const report = {
    id,
    dataBuilder: 'countCalculatedValuesPerOrgUnit',
    dataBuilderConfig: {
      ...BASE_DATA_BUILDER_CONFIG,
      dataSourceEntityFilter: {
        attributes: {
          type: schoolType,
        },
      },
    },
    viewJson: {
      ...BASE_VIEW_JSON,
      name,
    },
  };

  await insertObject(db, 'dashboardReport', report);

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${report.id} }'
    WHERE
    "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

const removeReport = async (db, id) => {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${id}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${id}')
    WHERE
    "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};
exports.up = async function (db) {
  await Promise.all(
    REPORTS.map(report => {
      return addReport(db, report);
    }),
  );
};

exports.down = async function (db) {
  await Promise.all(
    REPORTS.map(report => {
      return removeReport(db, report.id);
    }),
  );
};

exports._meta = {
  version: 1,
};
