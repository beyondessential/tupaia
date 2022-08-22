/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createModelsStub as baseCreateModelsStub, TYPES } from '@tupaia/database';

export const DATA_ELEMENTS = {
  DE_1_NOT_MAPPED: {
    code: 'DE_1_NOT_MAPPED',
    service_type: 'dhis',
    config: { dhisInstanceCode: 'dhis_instance_1' },
    databaseType: TYPES.DATA_ELEMENT,
  },
  DE_2_MAPPED: {
    code: 'DE_2_MAPPED',
    service_type: 'dhis',
    config: { dhisInstanceCode: 'dhis_instance_1' },
    databaseType: TYPES.DATA_ELEMENT,
  },
  DE_3_MAPPED_MULTI: {
    code: 'DE_3_MAPPED_MULTI',
    service_type: 'dhis',
    config: { dhisInstanceCode: 'dhis_instance_1' },
    databaseType: TYPES.DATA_ELEMENT,
  },
};

export const DATA_GROUPS = {
  DG_1: {
    code: 'DG_1',
    service_type: 'dhis',
    config: { dhisInstanceCode: 'dhis_instance_1' },
    databaseType: TYPES.DATA_GROUP,
  },
};

export const ENTITIES = {
  FJ_Facility_1: { code: 'FJ_Facility_1', country_code: 'FJ' },
  TO_Facility_1: { code: 'TO_Facility_1', country_code: 'TO' },
  PROJECT_1: { code: 'PROJECT_1', country_code: null },
};

export const DHIS_INSTANCES = {
  dhis_instance_1: { code: 'dhis_instance_1', service_type: 'dhis', config: {} },
  dhis_instance_2: { code: 'dhis_instance_2', service_type: 'dhis', config: {} },
  dhis_instance_3: { code: 'dhis_instance_3', service_type: 'dhis', config: {} },
};

const DATA_ELEMENT_DATA_SERVICES = [
  {
    data_element_code: 'DE_2_MAPPED',
    country_code: 'FJ',
    service_type: 'dhis',
    service_config: { dhisInstanceCode: 'dhis_instance_2' },
  },
  {
    data_element_code: 'DE_2_MAPPED',
    country_code: 'TO',
    service_type: 'dhis',
    service_config: { dhisInstanceCode: 'dhis_instance_3' },
  },
  {
    data_element_code: 'DE_3_MAPPED_MULTI',
    country_code: 'FJ',
    service_type: 'dhis',
    service_config: { dhisInstanceCode: 'dhis_instance_2' },
  },
  {
    data_element_code: 'DE_3_MAPPED_MULTI',
    country_code: 'FJ',
    service_type: 'dhis',
    service_config: { dhisInstanceCode: 'dhis_instance_3' },
  },
];

export const createModelsStub = () => {
  return baseCreateModelsStub({
    dataElement: {
      records: Object.values(DATA_ELEMENTS),
    },
    dataGroup: {
      records: Object.values(DATA_GROUPS),
    },
    entity: {
      records: Object.values(ENTITIES),
    },
    dhisInstance: {
      records: Object.values(DHIS_INSTANCES),
    },
    dataElementDataService: {
      records: DATA_ELEMENT_DATA_SERVICES,
    },
  });
};
