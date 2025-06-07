import { generateId } from '@tupaia/database';
import { FACT_CURRENT_SYNC_TICK } from '@tupaia/sync';

import { VIZ_BUILDER_PERMISSION_GROUP } from '../../../permissions';

const permissionGroupId = generateId();

const CURRENT_SYNC_TICK_FACT = {
  id: generateId(),
  key: FACT_CURRENT_SYNC_TICK,
  value: '1',
};

const DASHBOARD_ITEMS = [
  {
    id: generateId(),
    code: 'Modern_Report',
    config: { name: 'Modern Dashboard Item', type: 'view', viewType: 'singleValue' },
    report_code: 'Modern_Report',
    legacy: false,
    permissionGroupIds: [],
    updated_at_sync_tick: CURRENT_SYNC_TICK_FACT.value,
  },
  {
    id: generateId(),
    code: 'Legacy_Report',
    config: { name: 'Legacy Dashboard Item', type: 'chart', chartType: 'bar' },
    report_code: 'Legacy_Report',
    legacy: true,
    permissionGroupIds: [],
    updated_at_sync_tick: CURRENT_SYNC_TICK_FACT.value,
  },
  {
    id: generateId(),
    code: 'Dashboard_Item_No_Report',
    legacy: true,
    config: {},
    updated_at_sync_tick: CURRENT_SYNC_TICK_FACT.value,
  },
  {
    id: generateId(),
    code: 'Dashboard_Item_Invalid_Report',
    config: {},
    legacy: true,
    report_code: 'Invalid_Report',
    updated_at_sync_tick: CURRENT_SYNC_TICK_FACT.value,
  },
];

const PERMISSION_GROUPS = [
  {
    id: permissionGroupId,
    name: VIZ_BUILDER_PERMISSION_GROUP,
    updated_at_sync_tick: CURRENT_SYNC_TICK_FACT.value,
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
    updated_at_sync_tick: CURRENT_SYNC_TICK_FACT.value,
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
    updated_at_sync_tick: CURRENT_SYNC_TICK_FACT.value,
  },
];

export const TEST_SETUP = {
  dbRecords: {
    dashboardItem: DASHBOARD_ITEMS,
    permissionGroup: PERMISSION_GROUPS,
    report: REPORTS,
    legacyReport: LEGACY_REPORTS,
  },
  currentSyncTickFact: CURRENT_SYNC_TICK_FACT,
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
