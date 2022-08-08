/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataElement, DataGroup, ServiceType } from '../../types';
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
