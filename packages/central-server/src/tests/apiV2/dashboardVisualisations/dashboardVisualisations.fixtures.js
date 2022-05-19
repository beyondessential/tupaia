/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { generateTestId } from '@tupaia/database';

const permissionGroupId = generateTestId();

const DASHBOARD_ITEMS = [
  {
    id: generateTestId(),
    code: 'Modern_Dashboard_Item',
    config: { name: 'Modern Dashboard Item', type: 'view', viewType: 'singleValue' },
    report_code: 'Modern_Report',
    legacy: false,
  },
  {
    id: generateTestId(),
    code: 'Legacy_Dashboard_Item',
    config: { name: 'Legacy Dashboard Item', type: 'chart', chartType: 'bar' },
    report_code: 'Legacy_Report',
    legacy: true,
  },
  {
    id: generateTestId(),
    code: 'Dashboard_Item_No_Report',
    config: {},
  },
  {
    id: generateTestId(),
    code: 'Dashboard_Item_Invalid_Report',
    config: {},
    report_code: 'Invalid_Report',
  },
];

const PERMISSION_GROUPS = [
  {
    id: permissionGroupId,
    name: 'Viz_Permissions',
  },
];

const REPORTS = [
  {
    code: 'Modern_Report',
    config: {
      fetch: {
        dataElements: ['BCD1'],
        aggregations: ['FINAL_EACH_YEAR'],
      },
      transform: [{ by: '=$dataElement', transform: 'sortRows' }],
    },
    permission_group_id: permissionGroupId,
  },
];

const LEGACY_REPORTS = [
  {
    code: 'Legacy_Report',
    data_builder: 'analytics',
    data_builder_config: {
      dataElementCodes: ['BCD1'],
    },
    data_services: [{ isDataRegional: true }],
  },
];

export const TEST_SETUP = {
  dbRecords: {
    dashboardItem: DASHBOARD_ITEMS,
    permissionGroup: PERMISSION_GROUPS,
    report: REPORTS,
    legacyReport: LEGACY_REPORTS,
  },
};

export const findTestRecordByCode = (recordType, code) => {
  const recordsForType = TEST_SETUP.dbRecords[recordType] || [];
  const fixture = recordsForType.find(record => record.code === code);
  if (!fixture) {
    throw new Error(
      `Test error: could not find fixture with type '${recordType}' and code '${code}'`,
    );
  }

  return fixture;
};
