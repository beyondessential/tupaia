import { Analytic, DataElementDataService, DataElementMetadata, Event } from '../../types';
import {
  dataElementTypes,
  dataGroupTypes,
  dataServiceSyncGroupTypes,
  entities,
} from '../testUtils';

// Data elements and groups share the same codes on purpose, to assert that
// `DataBroker` can still distinguish them using their type
export const DATA_ELEMENTS = dataElementTypes({
  DHIS_01: { code: 'DHIS_01', service_type: 'dhis' },
  DHIS_02: { code: 'DHIS_02', service_type: 'dhis' },
  TUPAIA_01: { code: 'TUPAIA_01', service_type: 'tupaia' },
  MAPPED_01: { code: 'MAPPED_01', service_type: 'dhis' },
  MAPPED_02: { code: 'MAPPED_02', service_type: 'dhis' },
  RESTRICTED_01: {
    code: 'RESTRICTED_01',
    service_type: 'tupaia',
    permission_groups: ['Admin'],
  },
});
export const DATA_GROUPS = dataGroupTypes({
  DHIS_PROGRAM_01: { code: 'DHIS_PROGRAM_01', service_type: 'dhis' },
  DHIS_PROGRAM_02: { code: 'DHIS_PROGRAM_02', service_type: 'dhis' },
  TUPAIA_PROGRAM_01: { code: 'TUPAIA_PROGRAM_01', service_type: 'tupaia' },
});

export const SYNC_GROUPS = dataServiceSyncGroupTypes({
  DHIS_SYNC_GROUP_01: {
    code: 'DHIS_SYNC_GROUP_01',
    data_group_code: 'DHIS_SYNC_GROUP_01',
    service_type: 'dhis',
  },
  DHIS_SYNC_GROUP_02: {
    code: 'DHIS_SYNC_GROUP_02',
    data_group_code: 'DHIS_SYNC_GROUP_02',
    service_type: 'dhis',
  },
  TUPAIA_SYNC_GROUP_01: {
    code: 'TUPAIA_SYNC_GROUP_01',
    data_group_code: 'TUPAIA_SYNC_GROUP_01',
    service_type: 'tupaia',
  },
});

export interface MockServiceData {
  analytics: Analytic[];
  eventsByProgram: Record<string, Event[]>;
  dataElements: DataElementMetadata[];
}

export const DATA_BY_SERVICE = {
  dhis: {
    analytics: [
      { dataElement: 'DHIS_01', organisationUnit: 'TO', period: '20210101', value: 1 },
      { dataElement: 'DHIS_02', organisationUnit: 'TO', period: '20210101', value: 2 },
    ],
    eventsByProgram: {
      DHIS_PROGRAM_01: [
        {
          event: 'dhisEventId1',
          eventDate: '2020-02-06T10:18:00.000',
          orgUnit: 'TO',
          orgUnitName: 'Tonga',
          dataValues: { DHIS_01: 10 },
        },
      ],
      DHIS_PROGRAM_02: [
        {
          event: 'dhisEventId2',
          eventDate: '2020-02-06T10:18:00.000',
          orgUnit: 'TO',
          orgUnitName: 'Tonga',
          dataValues: { DHIS_02: 20 },
        },
      ],
      DHIS_SYNC_GROUP_01: [
        {
          event: 'dhisEventId3',
          eventDate: '2021-02-06T10:18:00.000',
          orgUnit: 'TO',
          orgUnitName: 'Tonga',
          dataValues: { DHIS_01: 30 },
        },
      ],
      DHIS_SYNC_GROUP_02: [
        {
          event: 'dhisEventId4',
          eventDate: '2021-01-06T10:18:00.000',
          orgUnit: 'TO',
          orgUnitName: 'Tonga',
          dataValues: { DHIS_02: 40 },
        },
      ],
    },
    dataElements: [
      { code: 'DHIS_01', name: 'DHIS element 1' },
      { code: 'DHIS_02', name: 'DHIS element 2' },
    ],
  },
  tupaia: {
    analytics: [
      { dataElement: 'TUPAIA_01', organisationUnit: 'TO', period: '20210101', value: 3 },
      { dataElement: 'RESTRICTED_01', organisationUnit: 'TO', period: '20210101', value: 4 },
      { dataElement: 'RESTRICTED_01', organisationUnit: 'FJ', period: '20210101', value: 5 },
    ],
    eventsByProgram: {
      TUPAIA_PROGRAM_01: [
        {
          event: 'tupaiaEventId1',
          eventDate: '2020-02-06T10:18:00.000',
          orgUnit: 'TO',
          orgUnitName: 'Tonga',
          dataValues: { TUPAIA_01: 50 },
        },
      ],
      TUPAIA_SYNC_GROUP_01: [
        {
          event: 'tupaiaEventId2',
          eventDate: '2020-02-06T10:18:00.000',
          orgUnit: 'TO',
          orgUnitName: 'Tonga',
          dataValues: { TUPAIA_01: 60 },
        },
      ],
    },
    dataElements: [{ code: 'TUPAIA_01', name: 'Tupaia element 1' }],
  },
};

export const ENTITIES = entities({
  TO_FACILITY_01: {
    code: 'TO_FACILITY_01',
    name: 'Tonga facility 1',
    country_code: 'TO',
    type: 'facility',
  },
  FJ_FACILITY_01: {
    code: 'FJ_FACILITY_01',
    name: 'Fiji facility 1',
    country_code: 'FJ',
    type: 'facility',
  },
  TO: {
    code: 'TO',
    name: 'Tonga',
    country_code: 'TO',
    type: 'country',
  },
  FJ: {
    code: 'FJ',
    name: 'Fiji',
    country_code: 'FJ',
    type: 'country',
  },
});

export const DATA_ELEMENT_DATA_SERVICES: DataElementDataService[] = [
  {
    data_element_code: 'MAPPED_01',
    country_code: 'FJ',
    service_type: 'tupaia',
    service_config: {
      dhisInstanceCode: 'dhis_instance_1',
    },
  },
  {
    data_element_code: 'MAPPED_02',
    country_code: 'FJ',
    service_type: 'tupaia',
    service_config: {
      dhisInstanceCode: 'dhis_instance_2',
    },
  },
];
