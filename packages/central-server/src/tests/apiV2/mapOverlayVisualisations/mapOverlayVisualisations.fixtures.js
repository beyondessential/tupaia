import { generateId } from '@tupaia/database';
import { FACT_CURRENT_SYNC_TICK } from '@tupaia/sync';

import { VIZ_BUILDER_PERMISSION_GROUP } from '../../../permissions';

const permissionGroupId = generateId();
const testPermissionGroupId = generateId();

const CURRENT_SYNC_TICK_FACT = {
  id: generateId(),
  key: FACT_CURRENT_SYNC_TICK,
  value: '1',
};

const MAP_OVERLAYS = [
  {
    id: generateId(),
    code: 'Modern_Map_Overlay',
    name: 'Modern Map Overlay',
    config: { displayType: 'spectrum', scaleType: 'neutral' },
    permission_group: 'Test Permission Group',
    country_codes: '{DL}',
    linkedMeasures: [],
    project_codes: '{explore}',
    report_code: 'Modern_Report',
    data_services: [{ isDataRegional: true }],
    legacy: false,
    updated_at_sync_tick: CURRENT_SYNC_TICK_FACT.value,
  },
];

const PERMISSION_GROUPS = [
  {
    id: permissionGroupId,
    name: VIZ_BUILDER_PERMISSION_GROUP,
    updated_at_sync_tick: CURRENT_SYNC_TICK_FACT.value,
  },
  {
    id: testPermissionGroupId,
    name: 'Test Permission Group',
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
    mapOverlay: MAP_OVERLAYS,
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
