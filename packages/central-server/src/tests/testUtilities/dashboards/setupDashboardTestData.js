import { findOrCreateDummyRecord } from '@tupaia/database';

export const findOrCreateDashboard = async (models, code, rootEntityCode) => {
  return findOrCreateDummyRecord(
    models.dashboard,
    { code },
    {
      id: code,
      name: code,
      root_entity_code: rootEntityCode,
    },
  );
};

export const findOrCreateLegacyDashboardItem = async (models, code) => {
  const legacyReport = await findOrCreateDummyRecord(
    models.legacyReport,
    { code },
    {
      data_builder: 'sample',
      data_builder_config: '{}',
      data_services: '[]',
    },
  );

  const dashboardItem = await findOrCreateDummyRecord(
    models.dashboardItem,
    { id: code },
    {
      code,
      config: '{}',
      report_code: code,
      legacy: true,
    },
  );

  return [legacyReport, dashboardItem];
};

export const setupDashboardTestData = async models => {
  // Still create these existing entities just in case test database for some reasons do not have these records.
  await findOrCreateDummyRecord(models.entity, {
    code: 'KI_Phoenix Islands',
    type: 'district',
    country_code: 'KI',
  });

  // Set up legacy reports
  const [districtLegacyReport1, districtDashboardItem1] = await findOrCreateLegacyDashboardItem(
    models,
    'district_report_1_test',
  );
  const [nationalLegacyReport1, nationalDashboardItem1] = await findOrCreateLegacyDashboardItem(
    models,
    'national_report_1_test',
  );
  const [nationalLegacyReport2, nationalDashboardItem2] = await findOrCreateLegacyDashboardItem(
    models,
    'national_report_2_test',
  );
  const [nationalLegacyReport3, nationalDashboardItem3] = await findOrCreateLegacyDashboardItem(
    models,
    'national_report_3_test',
  );
  const [projectLegacyReport1, projectDashboardItem1] = await findOrCreateLegacyDashboardItem(
    models,
    'project_report_1_test',
  );

  // Set up the dashboards
  const districtDashboard1 = await findOrCreateDashboard(
    models,
    'report_district_dashboard_1_test',
    'KI_Phoenix Islands',
  );
  const nationalDashboard1 = await findOrCreateDashboard(
    models,
    'report_national_dashboard_1_test',
    'KI',
  );
  const nationalDashboard2 = await findOrCreateDashboard(
    models,
    'report_national_dashboard_2_test',
    'LA',
  );
  const projectDashboard1 = await findOrCreateDashboard(
    models,
    'report_project_level_dashboard_1_test',
    'test_project',
  );

  // Set up dashboard relations
  const districtDashboardRelation1 = await findOrCreateDummyRecord(
    models.dashboardRelation,
    {
      dashboard_id: districtDashboard1.id,
      child_id: districtDashboardItem1.id,
    },
    {
      id: `${districtDashboard1.id}-${districtDashboardItem1.id}`,
      permission_groups: ['Admin'],
      entity_types: ['district'],
      project_codes: ['explore'],
    },
  );
  const nationalDashboardRelation1 = await findOrCreateDummyRecord(
    models.dashboardRelation,
    {
      dashboard_id: nationalDashboard1.id,
      child_id: nationalDashboardItem1.id,
    },
    {
      id: `${nationalDashboard1.id}-${nationalDashboardItem1.id}`,
      permission_groups: ['Admin'],
      entity_types: ['country'],
      project_codes: ['explore'],
    },
  );
  const nationalDashboardRelation2 = await findOrCreateDummyRecord(
    models.dashboardRelation,
    {
      dashboard_id: nationalDashboard1.id,
      child_id: nationalDashboardItem2.id,
    },
    {
      id: `${nationalDashboard1.id}-${nationalDashboardItem2.id}`,
      permission_groups: ['Admin'],
      entity_types: ['country'],
      project_codes: ['explore'],
    },
  );
  const nationalDashboardRelation3a = await findOrCreateDummyRecord(
    models.dashboardRelation,
    {
      dashboard_id: nationalDashboard1.id,
      child_id: nationalDashboardItem3.id,
    },
    {
      id: `${nationalDashboard1.id}-${nationalDashboardItem3.id}`,
      permission_groups: ['Admin'],
      entity_types: ['country'],
      project_codes: ['explore'],
    },
  );
  const nationalDashboardRelation3b = await findOrCreateDummyRecord(
    models.dashboardRelation,
    {
      dashboard_id: nationalDashboard2.id,
      child_id: nationalDashboardItem3.id,
    },
    {
      id: `${nationalDashboard2.id}-${nationalDashboardItem3.id}`,
      permission_groups: ['Admin'],
      entity_types: ['country'],
      project_codes: ['explore'],
    },
  );
  const projectDashboardRelation1 = await findOrCreateDummyRecord(
    models.dashboardRelation,
    {
      dashboard_id: projectDashboard1.id,
      child_id: projectDashboardItem1.id,
    },
    {
      id: `${projectDashboard1.id}-${projectDashboardItem1.id}`,
      permission_groups: ['Admin'],
      entity_types: ['project'],
      project_codes: ['test_project'],
    },
  );

  return {
    districtLegacyReport1,
    nationalLegacyReport1,
    nationalLegacyReport2,
    nationalLegacyReport3,
    projectLegacyReport1,

    districtDashboardItem1,
    nationalDashboardItem1,
    nationalDashboardItem2,
    nationalDashboardItem3,
    projectDashboardItem1,

    districtDashboard1,
    nationalDashboard1,
    nationalDashboard2,
    projectDashboard1,

    districtDashboardRelation1,
    nationalDashboardRelation1,
    nationalDashboardRelation2,
    nationalDashboardRelation3a,
    nationalDashboardRelation3b,
    projectDashboardRelation1,
  };
};
