import { EntityTypeEnum } from '@tupaia/types';
import { DataServiceMapping } from '../../../services/DataServiceMapping';
import { DhisEventAnalytics } from '../../../services/dhis/types';
import { dataElements, dataGroups, entityType } from '../../testUtils';

export const SERVER_NAME = 'test server name';

export const DATA_ELEMENTS = dataElements({
  POP01: { code: 'POP01', dataElementCode: 'POP01', service_type: 'dhis' },
  POP02: { code: 'POP02', dataElementCode: 'POP02', service_type: 'dhis' },
  DIF01: { code: 'DIF01', dataElementCode: 'DIF01_DHIS', service_type: 'dhis' },
  NON_DHIS_1: { code: 'NON_DHIS_1', service_type: 'superset' },
});

export const DATA_GROUPS = dataGroups({
  // code is intentionally the same as `POP01` data element, as their type should differentiate them
  POP01_GROUP: { code: 'POP01', service_type: 'dhis' },
  DIFF_GROUP: { code: 'DIFF_GROUP', service_type: 'dhis' },
  NON_DHIS_2: { code: 'NON_DHIS_2', service_type: 'superset' },
});

const DL_FACILITY_A = entityType({
  code: 'DL_FACILITY_A',
  name: 'DL FACILITY A',
  type: EntityTypeEnum.facility,
  metadata: {},
  isTrackedEntity: () => false,
});

export const ENTITIES = {
  DL_FACILITY_A,
  DL_HOUSEHOLD_1: entityType({
    code: 'DL_HOUSEHOLD_1',
    name: 'DL HOUSEHOLD 1',
    type: EntityTypeEnum.household,
    metadata: {
      dhis: { trackedEntityId: 'tracked_entity_id_dl_household_1' },
    },
    isTrackedEntity: () => true,
    getParent: async () => DL_FACILITY_A,
  }),
  DL_HOUSEHOLD_2: entityType({
    code: 'DL_HOUSEHOLD_2',
    name: 'DL HOUSEHOLD 2',
    type: EntityTypeEnum.household,
    metadata: {
      dhis: { trackedEntityId: 'tracked_entity_id_dl_household_2' },
    },
    isTrackedEntity: () => true,
    getParent: async () => DL_FACILITY_A,
  }),
};

export const ENTITY_HIERARCHIES = {
  explore: {
    name: 'explore',
    id: '1234',
  },
};

export const DATA_VALUES = {
  POP01: { code: 'POP01', value: '1', orgUnit: 'TO', period: '20210101' },
  POP02: { code: 'POP02', value: '2', orgUnit: 'TO', period: '20210101' },
  DIF01: { code: 'DIF01', value: '3', orgUnit: 'TO', period: '20210101' },
};

export const DHIS_RESPONSE_DATA_ELEMENTS = {
  POP01: { code: 'POP01', uid: 'id000POP01', name: 'Population 1' },
  POP02: { code: 'POP02', uid: 'id000POP02', name: 'Population 2' },
  DIF01_DHIS: { code: 'DIF01_DHIS', uid: 'id000DIF01_DHIS', name: 'Different 1' },
};

export const DATA_ELEMENTS_BY_GROUP = {
  POP01: [DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02],
  DIFF_GROUP: [DATA_ELEMENTS.POP01, DATA_ELEMENTS.DIF01],
};

// A simple mapping with no country-specific overrides
export const DEFAULT_DATA_SERVICE_MAPPING = new DataServiceMapping(
  Object.values(DATA_ELEMENTS).map(de => ({
    dataSource: de,
    service_type: de.service_type,
    config: de.config,
  })),
  Object.values(DATA_GROUPS).map(dg => ({
    dataSource: dg,
    service_type: dg.service_type,
    config: dg.config,
  })),
);

export const DHIS_REFERENCE = 'XXXYYY';

const EVENT_ANALYTICS_SAME_DHIS_ELEMENT_CODES: DhisEventAnalytics = {
  headers: [
    { name: 'oucode', column: 'Organisation unit code', valueType: 'TEXT' },
    { name: 'POP01', column: 'Population 1', valueType: 'NUMBER' },
    { name: 'BCD2', column: 'Population 2', valueType: 'TEXT' },
  ],
  metaData: {
    items: {
      ou: { name: 'Organisation unit' },
      POP01: { name: 'Population 1' },
      POP02: { name: 'Population 2' },
    },
    dimensions: {
      ou: ['tonga_dhisId'],
      POP01: [],
      POP02: [],
    },
  },
  width: 3,
  height: 1,
  rows: [['TO_Nukuhc', '10.0', '15.0']],
};

const EVENT_ANALYTICS_DIFFERENT_DHIS_ELEMENT_CODES: DhisEventAnalytics = {
  headers: [
    { name: 'oucode', column: 'Organisation unit code', valueType: 'TEXT' },
    { name: 'DIF01_DHIS', column: 'Different 1', valueType: 'NUMBER' },
  ],
  metaData: {
    items: {
      ou: { name: 'Organisation unit' },
      DIF01_DHIS: { name: 'Different 1' },
    },
    dimensions: {
      ou: ['tonga_dhisId'],
      DIF01_DHIS: [],
    },
  },
  width: 2,
  height: 1,
  rows: [['TO_Nukuhc', '25.0']],
};

export const EVENT_ANALYTICS = {
  sameDhisElementCodes: EVENT_ANALYTICS_SAME_DHIS_ELEMENT_CODES,
  differentDhisElementCodes: EVENT_ANALYTICS_DIFFERENT_DHIS_ELEMENT_CODES,
};
