/**
 * Tupaia
 * Copyright (c) 2023 - 2026 Beyond Essential Systems Pty Ltd
 */
import { findOrCreateDummyRecord } from '@tupaia/database';

export const setupMailingList = async models => {
  const entity = await findOrCreateDummyRecord(models.entity, {
    code: 'Fairfield',
    type: 'district',
    country_code: 'DL',
  });
  const adminPermission = await findOrCreateDummyRecord(models.permissionGroup, {
    name: 'Admin',
  });
  const otherPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
    name: 'Other',
    parent_id: adminPermission.id,
  });
  const permissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
    name: 'Testing',
    parent_id: otherPermissionGroup.id,
  });

  const dashboard1 = await findOrCreateDummyRecord(models.dashboard, {
    root_entity_code: entity.code,
    code: 'DASH_1',
  });
  const dashboard2 = await findOrCreateDummyRecord(models.dashboard, {
    root_entity_code: entity.code,
    code: 'DASH_2',
  });
  const dashboard3 = await findOrCreateDummyRecord(models.dashboard, {
    root_entity_code: entity.code,
    code: 'DASH_3',
  });
  console.log('d1', dashboard1.id);
  console.log('d2', dashboard2.id);
  console.log('d3', dashboard3.id);
  const dashboardItem = await findOrCreateDummyRecord(models.dashboardItem, {
    code: 'Test Dashboard Item',
    config: {},
    report_code: 'test_item',
    legacy: false,
    permission_group_ids: `{${permissionGroup.id}}`,
  });
  const otherDashboardItem = await findOrCreateDummyRecord(models.dashboardItem, {
    code: 'Other Test Dashboard Item',
    config: {},
    report_code: 'test_item2',
    legacy: false,
    permission_group_ids: `{${otherPermissionGroup.id}}`,
  });
  await findOrCreateDummyRecord(models.dashboardRelation, {
    dashboard_id: dashboard1.id,
    child_id: dashboardItem.id,
    entity_types: `{district}`,
    project_codes: `{explore}`,
    permission_groups: '{Testing}',
  });
  await findOrCreateDummyRecord(models.dashboardRelation, {
    dashboard_id: dashboard2.id,
    child_id: dashboardItem.id,
    entity_types: `{district}`,
    project_codes: `{explore}`,
    permission_groups: '{Testing}',
  });
  await findOrCreateDummyRecord(models.dashboardRelation, {
    dashboard_id: dashboard3.id,
    child_id: otherDashboardItem.id,
    entity_types: `{district}`,
    project_codes: `{explore}`,
    permission_groups: '{Other}',
  });

  const dashboardMailingListItem1 = await findOrCreateDummyRecord(models.dashboardMailingList, {
    email: 'tonga-worker@tutanota.com',
    dashboard_id: dashboard1.id,
  });
  await findOrCreateDummyRecord(models.dashboardMailingList, {
    email: 'tonga-manager@tutanota.com',
    dashboard_id: dashboard2.id,
  });
  await findOrCreateDummyRecord(models.dashboardMailingList, {
    email: 'tonga-supervisor@tutanota.com',
    dashboard_id: dashboard3.id,
  });

  const permissions = await models.permissionGroup.all();
  console.log(
    'permissions',
    permissions.map(p => p.id),
  );

  return dashboardMailingListItem1;
};
