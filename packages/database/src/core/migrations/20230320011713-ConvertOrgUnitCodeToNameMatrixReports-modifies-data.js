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
  'explore_dl_annual_report_out_of_stock',
  'hps_ws_bar_compliance_schools_tobacco_control_component',
  'hps_ws_bar_compliance_schools_safe_learning_environment',
  'hps_ws_bar_overall_compliance_schools',
  'hps_ws_bar_compliance_primary_schools_physical_activity_nutrition_baseline',
  'hps_ws_bar_compliance_of_schools_with_community_support_component',
  'strive_png_n_bar_k13_pcr_results',
  'mda_fj_sd_total_mda_recipients_by_sex_dose1',
  'mda_fj_sd_total_mda_recipients_by_sex',
  'mda_fj_d_total_mda_recipients_by_sex_dose1',
  'mda_fj_d_total_mda_recipients_by_sex',
  'mda_fj_n_total_mda_recipients_by_sex_dose1',
  'mda_fj_n_total_mda_recipients_by_sex',
  'LESMIS_num_schools_by_district',
  'tupaia_metrics_n_users_by_country',
  'tupaia_metrics_n_visuals_by_country',
  'tupaia_metrics_n_datapoints_by_country',
  'tupaia_metrics_n_mapoverlays_by_country',
  'tupaia_metrics_n_meditrak_by_country',
  'tupaia_metrics_n_reports_by_country',
  'ncd_nr_bar_clients_screened_cvd_risk_orange_red',
  'strive_png_f_bar_febrille_illness_cases_reported_by_village',
  'strive_png_n_bar_weekly_cases_by_health_facility',
  'covid_to_stackbar_vax_status_by_isolation_site',
  'LESMIS_gross_intake_ratio_lower_secondary_province_summary',
  'LESMIS_gross_intake_ratio_primary_province_summary',
  'covid_n_bar_number_vaccinated_by_gender',
  'imms_covid_tv_bar_fully_vaccinated_by_gender',
  'covid_nr_bar_covid_testing_results_district',
  'UNFPA_Region_Percentage_Facilities_Offering_Services_ANC',
  'UNFPA_Region_Percentage_Facilities_Offering_Services_Delivery',
  'rh_line_facilities_with_AYFSRH_trained_health_worker',
  'rh_line_facilities_with_family_planning_trained_worker',
  'rh_line_facilities_with_larc_trained_health_worker',
  'rh_line_facilities_with_staff_trained_in_logistics_mgmt',
  'Fiji_SupplyChain_Laboratory_Items_Availability_By_Nursing_Stations',
  'Fiji_SupplyChain_Laboratory_Items_Availability_By_Health_Centres',
  'Fiji_SupplyChain_Laboratory_Items_Availability_By_Sub_Divisional_Hospitals',
  'Fiji_SupplyChain_Laboratory_Items_Availability_By_Divisional_Hospitals',
  'ncd_ws_bar_sch_nutrition_standards_compliance_rating_fol_up',
  'covid_nr_bar_covid_cases_by_district',
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
    const amendedTransform = currentTransform.replaceAll(
      'orgUnitCodeToName($organisationUnit)',
      '$organisationUnit',
    );
    amendedTransformArray[0] = JSON.parse(amendedTransform);
    return amendedTransformArray;
  }
  const amendedTransform = currentTransform.replace('orgUnitCodeToName($orgUnit)', '$orgUnit');
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
    const initialFetchType = transform[0].dataTableCode;
    const transformsWithExtraFetch = createNewTransforms(initialFetchType);
    const firstPartOfTransform = transform.slice(0, indexOfImpactedTransform);
    const lastPartOfTransform = transform.slice(indexOfImpactedTransform);
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
