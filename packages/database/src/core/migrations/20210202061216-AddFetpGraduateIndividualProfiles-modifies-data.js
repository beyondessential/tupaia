'use strict';

import { arrayToDbString, insertObject } from '../utilities';

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

const dataServices = [{ isDataRegional: true }];

const buildTable = report => {
  const mapElementsToCells = element =>
    report.elementConfigs && element in report.elementConfigs
      ? [report.elementConfigs[element]]
      : [element];

  const dataBuilderConfig = {
    rows: Object.values(report.elements),
    cells: Object.keys(report.elements).map(mapElementsToCells),
    columns: ['main'],
    entityAggregation: {
      aggregationType: 'RAW',
      dataSourceEntityType: ['individual'],
    },
    noDataValue: '',
  };

  const viewJson = {
    name: report.name,
    type: 'view',
    viewType: 'multiValue',
    valueType: 'text',
  };

  return {
    id: report.id,
    dataBuilder: report.dataBuilder,
    dataBuilderConfig,
    viewJson,
    dataServices,
  };
};

const buildSingle = report => {
  const dataBuilderConfig = {
    dataElementCodes: report.elements,
  };
  const viewJson = {
    name: report.name,
    type: 'view',
    viewType: 'singleValue',
    noDataMessage: '',
  };
  return {
    id: report.id,
    dataBuilder: report.dataBuilder,
    dataBuilderConfig,
    viewJson,
    dataServices,
  };
};

const buildMultiSingle = report => {
  const dataBuilderConfig = {
    labels: report.elements,
    dataElementCodes: Object.keys(report.elements),
    filter: report.filter,
  };

  const viewJson = {
    name: report.name,
    type: 'view',
    viewType: 'multiSingleValue',
    valueType: 'text',
    noDataMessage: '',
  };

  return {
    id: report.id,
    dataBuilder: report.dataBuilder,
    dataBuilderConfig,
    viewJson,
    dataServices,
  };
};

const reports = [
  {
    id: 'FETP_PG_graduate_details',
    name: 'FETP Profile',
    configBuilder: buildTable,
    dataBuilder: 'nonMatrixTableFromCells',
    elements: {
      // FETPNG20Data_001: 'Name',
      // FETPNG20Data_042: 'Profile Photo',
      FETPNG20Data_003: 'FETPNG Year completed',
      FETPNG20Data_004: 'Advanced FETPNG Year completed',
      FETPNG20Data_005: 'Rapid Response Team (WHO Certified Training) Year completed',
      FETPNG20Data_006: 'Email address',
      FETPNG20Data_007: 'Phone Number',
      FETPNG20Data_010: 'Work Title',
      FETPNG20Data_009: 'Work Category',
      FETPNG20Data_032: 'Work Level',
      FETPNG20Data_034: 'District',
      FETPNG20Data_033: 'Province',
      FETPNG20Data_036: 'Employer Type',
    },
    elementConfigs: {
      FETPNG20Data_034: {
        key: 'District_name',
        field: 'name',
        operator: 'ORG_UNIT_METADATA',
        orgUnitCode: '{organisationUnitCode}',
        ancestorType: 'sub_district',
      },
      FETPNG20Data_033: {
        key: 'Province_name',
        field: 'name',
        operator: 'ORG_UNIT_METADATA',
        orgUnitCode: '{organisationUnitCode}',
        ancestorType: 'district',
      },
    },
  },
  {
    id: 'FETP_PG_graduate_area_of_expertise',
    name: 'Areas of Expertise',
    configBuilder: buildMultiSingle,
    dataBuilder: 'sumLatestPerMetric',
    elements: {
      FETPNG20Data_012: 'Animal health',
      FETPNG20Data_013: 'Community engagement',
      FETPNG20Data_014: 'Data analysis',
      FETPNG20Data_015: 'Data management',
      FETPNG20Data_016: 'Environmental health',
      FETPNG20Data_017: 'EPI',
      FETPNG20Data_018: 'HIV',
      FETPNG20Data_019: 'Lab',
      FETPNG20Data_020: 'Malaria',
      FETPNG20Data_021: 'MCH',
      FETPNG20Data_022: 'NCDs',
      FETPNG20Data_023: 'NTD',
      FETPNG20Data_024: 'Operational research',
      FETPNG20Data_025: 'Other research',
      FETPNG20Data_026: 'Outbreak response',
      FETPNG20Data_027: 'Surveillance',
      FETPNG20Data_028: 'TB',
      FETPNG20Data_029: 'Team leadership',
      FETPNG20Data_030: 'Other',
    },
    filter: { value: 'Yes' },
  },
  {
    id: 'FETP_PG_graduate_number_of_outbreaks',
    name: 'Number outbreaks investigated since graduating',
    configBuilder: buildSingle,
    dataBuilder: 'sumLatestPerMetric',
    elements: ['FETPNG20Data_038'],
  },
  {
    id: 'FETP_PG_graduate_number_of_outbreaks_lead',
    name: 'Number outbreaks investigated as lead investigator',
    configBuilder: buildSingle,
    dataBuilder: 'sumLatestPerMetric',
    elements: ['FETPNG20Data_039'],
  },
];
const reportIds = reports.map(r => r.id);
const reportConfigs = reports.map(report => report.configBuilder(report));

const dashboardGroupCode = 'PG_FETP_Individual_FETP_Graduates';
const dashboardGroup = {
  organisationLevel: 'Individual',
  userGroup: 'FETP Graduates',
  organisationUnitCode: 'PG',
  dashboardReports: `{${reportIds.join(',')}}`,
  name: 'FETP',
  code: dashboardGroupCode,
  projectCodes: `{fetp}`,
};

exports.up = async function (db) {
  await Promise.all(
    reportConfigs.map(reportConfig => insertObject(db, 'dashboardReport', reportConfig)),
  );
  await insertObject(db, 'dashboardGroup', dashboardGroup);
};

exports.down = function (db) {
  return db.runSql(`
    delete from "dashboardGroup" where code = '${dashboardGroupCode}';
    delete from "dashboardReport" where id in (${arrayToDbString(reportIds)});
  `);
};

exports._meta = {
  version: 1,
};
