/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataElement, DataElementDataService, DataGroup, Entity, ServiceType } from '../../types';
import { ServiceResults } from './DataBroker.stubs';

const dataElement = ({ code, service_type }: { code: string; service_type: ServiceType }) => ({
  code,
  service_type,
  dataElementCode: code,
  config: {},
  permission_groups: ['*'],
});

// Data elements and groups share the same codes on purpose, to assert that
// `DataBroker` can still distinguish them using their type
export const DATA_ELEMENTS: Record<string, DataElement> = {
  DHIS_01: dataElement({ code: 'DHIS_01', service_type: 'dhis' }),
  DHIS_02: dataElement({ code: 'DHIS_02', service_type: 'dhis' }),
  TUPAIA_01: dataElement({ code: 'TUPAIA_01', service_type: 'tupaia' }),
  MAPPED_01: dataElement({
    code: 'MAPPED_01',
    service_type: 'test',
  }),
  MAPPED_02: dataElement({
    code: 'MAPPED_02',
    service_type: 'test',
  }),
};
export const DATA_GROUPS: Record<string, DataGroup> = {
  DHIS_PROGRAM_01: { code: 'DHIS_PROGRAM_01', service_type: 'dhis', config: {} },
  DHIS_PROGRAM_02: { code: 'DHIS_PROGRAM_02', service_type: 'dhis', config: {} },
  TUPAIA_PROGRAM_01: { code: 'TUPAIA_PROGRAM_01', service_type: 'tupaia', config: {} },
};

export const DATA_BY_SERVICE: Record<string, ServiceResults> = {
  dhis: {
    analytics: [
      { dataElement: 'DHIS_01', organisationUnit: 'TO', period: '20210101', value: 1 },
      { dataElement: 'DHIS_02', organisationUnit: 'TO', period: '20210101', value: 2 },
    ],
    eventsByProgram: {
      DHIS_PROGRAM_01: [
        {
          event: 'eventId',
          eventDate: '2020-02-06T10:18:00.000',
          orgUnit: 'TO',
          orgUnitName: 'Tonga',
          dataValues: { DHIS_01: 10 },
        },
      ],
      DHIS_PROGRAM_02: [
        {
          event: 'eventId',
          eventDate: '2020-02-06T10:18:00.000',
          orgUnit: 'TO',
          orgUnitName: 'Tonga',
          dataValues: { DHIS_02: 20 },
        },
      ],
    },
    dataElements: [
      { code: 'DHIS_01', name: 'DHIS element 1' },
      { code: 'DHIS_02', name: 'DHIS element 2' },
    ],
  },
  tupaia: {
    analytics: [{ dataElement: 'TUPAIA_01', organisationUnit: 'TO', period: '20210101', value: 3 }],
    eventsByProgram: {
      TUPAIA_PROGRAM_01: [
        {
          event: 'eventId',
          eventDate: '2020-02-06T10:18:00.000',
          orgUnit: 'TO',
          orgUnitName: 'Tonga',
          dataValues: { TUPAIA_01: 30 },
        },
      ],
    },
    dataElements: [{ code: 'TUPAIA_01', name: 'Tupaia element 1' }],
  },
};

export const ENTITIES: Record<string, Entity> = {
  TO_FACILITY_01: {
    code: 'TO_FACILITY_01',
    name: 'Tonga facility 1',
    country_code: 'TO',
    type: 'facility',
    config: {},
  },
  FJ_FACILITY_01: {
    code: 'FJ_FACILITY_01',
    name: 'Fiji facility 1',
    country_code: 'FJ',
    type: 'facility',
    config: {},
  },
  TO: { code: 'TO', name: 'Tonga', country_code: 'TO', type: 'country', config: {} },
  FJ: { code: 'FJ', name: 'Fiji', country_code: 'FJ', type: 'country', config: {} },
};

export const DATA_ELEMENT_DATA_SERVICES: DataElementDataService[] = [
  {
    data_element_code: 'MAPPED_01',
    country_code: 'FJ',
    service_type: 'other',
    service_config: { cow: 'moo' },
  },
  {
    data_element_code: 'MAPPED_02',
    country_code: 'FJ',
    service_type: 'other',
    service_config: { sheep: 'baaaa' },
  },
];
