/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { findOrCreateDummyRecord } from '@tupaia/database';

export const setupDashboardTestData = async models => {
  // Set up legacy reports
  const districtLegacyReport1 = await findOrCreateDummyRecord(
    models.legacyReport,
    { code: 'district_legacy_report_1_test' },
    {
      data_builder: 'sample',
      data_builder_config: '{}',
      data_services: '[]',
    },
  );
  const nationalLegacyReport1 = await findOrCreateDummyRecord(
    models.legacyReport,
    { code: 'national_legacy_report_1_test' },
    {
      data_builder: 'sample',
      data_builder_config: '{}',
      data_services: '[]',
    },
  );
  const nationalLegacyReport2 = await findOrCreateDummyRecord(
    models.legacyReport,
    { code: 'national_legacy_report_2_test' },
    {
      data_builder: 'sample',
      data_builder_config: '{}',
      data_services: '[]',
    },
  );
  const nationalLegacyReport3 = await findOrCreateDummyRecord(
    models.legacyReport,
    { code: 'national_legacy_report_3_test' },
    {
      data_builder: 'sample',
      data_builder_config: '{}',
      data_services: '[]',
    },
  );
  const projectLegacyReport1 = await findOrCreateDummyRecord(
    models.legacyReport,
    { code: 'project_level_legacy_report_4_test' },
    {
      data_builder: 'sample',
      data_builder_config: '{}',
      data_services: '[]',
    },
  );

  // Set up dashboard items
  const districtDashboardItem1 = await findOrCreateDummyRecord(
    models.dashboardItem,
    { id: 'district_dashboard_item_1_test' },
    {
      code: 'district_dashboard_item_1_test',
      config: '{}',
      report_code: districtLegacyReport1.code,
      legacy: true,
    },
  );
  const nationalDashboardItem1 = await findOrCreateDummyRecord(
    models.dashboardItem,
    { id: 'national_dashboard_item_1_test' },
    {
      code: 'national_dashboard_item_1_test',
      config: '{}',
      report_code: nationalLegacyReport1.code,
      legacy: true,
    },
  );
  const nationalDashboardItem2 = await findOrCreateDummyRecord(
    models.dashboardItem,
    { id: 'national_dashboard_item_2_test' },
    {
      code: 'national_dashboard_item_2_test',
      config: '{}',
      report_code: nationalLegacyReport2.code,
      legacy: true,
    },
  );
  const nationalDashboardItem3 = await findOrCreateDummyRecord(
    models.dashboardItem,
    { id: 'national_dashboard_item_3_test' },
    {
      code: 'national_dashboard_item_3_test',
      config: '{}',
      report_code: nationalLegacyReport3.code,
      legacy: true,
    },
  );
  const projectDashboardItem1 = await findOrCreateDummyRecord(
    models.dashboardItem,
    { id: 'project_level_dashboard_item_4_test' },
    {
      code: 'project_level_dashboard_item_4_test',
      config: '{}',
      report_code: projectLegacyReport1.code,
      legacy: true,
    },
  );

  // Set up the dashboards
  const districtDashboard1 = await findOrCreateDummyRecord(
    models.dashboard,
    { code: 'report_district_dashboard_1_test' },
    {
      id: 'report_district_dashboard_1_test',
      name: 'Test district dashboard 1',
      root_entity_code: 'KI_Phoenix Islands',
    },
  );
  const nationalDashboard1 = await findOrCreateDummyRecord(
    models.dashboard,
    {
      code: 'report_national_dashboard_1_test',
    },
    {
      id: 'report_national_dashboard_1_test',
      name: 'Test national dashboard 1',
      root_entity_code: 'KI',
    },
  );
  const nationalDashboard2 = await findOrCreateDummyRecord(
    models.dashboard,
    {
      code: 'report_national_dashboard_2_test',
    },
    {
      id: 'report_national_dashboard_2_test',
      name: 'Test national dashboard 2',
      root_entity_code: 'LA',
    },
  );
  const projectDashboard1 = await findOrCreateDummyRecord(
    models.dashboard,
    { code: 'report_project_level_dashboard_3_test' },
    {
      id: 'report_project_level_dashboard_3_test',
      name: 'Test project level dashboard 3',
      root_entity_code: 'test_project',
    },
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
  const nationalDashboardRelation3 = await findOrCreateDummyRecord(
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
    nationalDashboardRelation3,
    projectDashboardRelation1,
  };
};
