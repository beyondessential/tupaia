'use strict';

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

const REPORTS = [
  'ch_to_mat_n_availability_core_cvd_dm_medicines',
  'rh_mat_p_reproductive_training_by_staff_type',
  'rh_mat_stock_availability_hfrsa_spot_check_with_percentage',
  'Fiji_SupplyChain_Facility_Level_Critical_Item_Availability_Matrix',
  'rh_mat_r_stock_availability_hfrsa_spot_check_with_percentage',
  'rh_mat_n_stock_availability_hfrsa_spot_check_with_percentage',
  'ch_to_mat_n_availability_essential_tools',
  'fanafana_to_f_matrix_pehs_by_facility',
  'FETP_PG_matrix_graduate_by_district',
  'impact_health_pg_sd_matrix_Detailed_Supervisory_Checklist_Results',
  'ncd_nr_matrix_cvd_screening_age_gender_by_district',
  'flu_au_matrix_n_participation_rate',
  'impact_health_pg_d_matrix_benchamark_facility_comparison',
];

const createNewTransforms = initialFetchType => {
  const orgUnitReference = initialFetchType === 'analytics' ? 'organisationUnit' : 'orgUnit';
  const fetchDataTransform = {
    transform: 'fetchData',
    dataTableCode: 'entities',
    parameters: {
      entityCodes: `=@all.${orgUnitReference}`,
      fields: ['code', 'name'],
    },
    join: [
      {
        tableColumn: `${orgUnitReference}`,
        newDataColumn: 'code',
      },
    ],
  };

  const updateColumnsTransform = {
    transform: 'updateColumns',
    insert: {
      [orgUnitReference]: '=$name',
    },
    exclude: ['code', 'name'],
  };

  return [fetchDataTransform, updateColumnsTransform];
};

const amendImpactedTransform = (lastPartOfTransform, initialFetchType) => {
  const amendedTransformArray = [...lastPartOfTransform];
  const currentTransform = JSON.stringify(lastPartOfTransform[0]);
  if (initialFetchType === 'analytics') {
    const amendedTransform = currentTransform.replace(
      'orgUnitCodeToName($organisationUnit)',
      '$organisationUnit',
    );
    amendedTransformArray[0] = JSON.parse(amendedTransform);
    return amendedTransformArray;
  }
  const amendedTransform = currentTransform.replace(
    'orgUnitCodeToName($orgUnit)',
    '$organisationUnit',
  );
  amendedTransformArray[0] = JSON.parse(amendedTransform);
  return amendedTransformArray;
};

exports.up = async function (db) {
  const { rows: reports } = await db.runSql(
    `SELECT * FROM report WHERE code IN (${arrayToDbString(REPORTS)});`,
  );

  for (const report of reports) {
    const { transform } = report.config;
    const containsOrgUnitCodeToName = tr => {
      const stringifiedTransform = JSON.stringify(tr);
      if (stringifiedTransform.includes('orgUnitCodeToName')) {
        return true;
      }
      return false;
    };

    const indexOfImpactedTransform = transform.findIndex(containsOrgUnitCodeToName);
    const transformsWithExtraFetch = createNewTransforms();
    const firstPartOfTransform = transform.slice(0, indexOfImpactedTransform);
    const lastPartOfTransform = transform.slice(indexOfImpactedTransform);
    const initialFetchType = transform[0].dataTableCode;
    const amendedLastPartOfTransform = amendImpactedTransform(
      lastPartOfTransform,
      initialFetchType,
    );

    const newConfig = {
      ...report.config,
      transform: [
        ...firstPartOfTransform,
        ...transformsWithExtraFetch,
        ...amendedLastPartOfTransform,
      ],
    };

    await db.runSql(
      `UPDATE report SET config = '${JSON.stringify(newConfig).replaceAll(
        "'",
        "''",
      )}'::json WHERE id = '${report.id}'`,
    );
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
