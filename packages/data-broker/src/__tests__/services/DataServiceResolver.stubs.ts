import { createModelsStub as baseCreateModelsStub, RECORDS } from '@tupaia/database';
import { entities } from '../testUtils';

export const DATA_ELEMENTS = {
  DE_1_NOT_MAPPED: {
    code: 'DE_1_NOT_MAPPED',
    service_type: 'dhis',
    config: { dhisInstanceCode: 'dhis_instance_1' },
    databaseRecord: RECORDS.DATA_ELEMENT,
  },
  DE_2_MAPPED: {
    code: 'DE_2_MAPPED',
    service_type: 'dhis',
    config: { dhisInstanceCode: 'dhis_instance_1' },
    databaseRecord: RECORDS.DATA_ELEMENT,
  },
  DE_3_MAPPED: {
    code: 'DE_3_MAPPED',
    service_type: 'dhis',
    config: { dhisInstanceCode: 'dhis_instance_1' },
    databaseRecord: RECORDS.DATA_ELEMENT,
  },
  DE_4_MAPPED_INVALID: {
    code: 'DE_4_MAPPED_INVALID',
    service_type: 'dhis',
    config: { dhisInstanceCode: 'dhis_instance_1' },
    databaseRecord: RECORDS.DATA_ELEMENT,
  },
} as const;

export const DATA_GROUPS = {
  DG_1: {
    code: 'DG_1',
    service_type: 'dhis',
    config: { dhisInstanceCode: 'dhis_instance_1' },
    databaseRecord: RECORDS.DATA_GROUP,
  },
} as const;

export const SYNC_GROUPS = {
  SG_1: {
    code: 'SG_1',
    service_type: 'kobo',
    config: {},
    databaseRecord: RECORDS.DATA_SERVICE_SYNC_GROUP,
  },
} as const;

export const ENTITIES = entities({
  FJ_Facility_1: { code: 'FJ_Facility_1', country_code: 'FJ', type: 'facility' },
  TO_Facility_1: { code: 'TO_Facility_1', country_code: 'TO', type: 'facility' },
  PROJECT_1: { code: 'PROJECT_1', country_code: null, type: 'project' },
});

export const DHIS_INSTANCES = {
  dhis_instance_1: { code: 'dhis_instance_1', service_type: 'dhis', config: {} },
  dhis_instance_2: { code: 'dhis_instance_2', service_type: 'dhis', config: {} },
  dhis_instance_3: { code: 'dhis_instance_3', service_type: 'dhis', config: {} },
};

const DATA_ELEMENT_DATA_SERVICES = [
  // DE_2_MAPPED is a normal mapping where different data services store data for different countries
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
  // DE_3_MAPPED is a normal mapping where a single data service stores data for different countries
  {
    data_element_code: 'DE_3_MAPPED',
    country_code: 'FJ',
    service_type: 'dhis',
    service_config: { dhisInstanceCode: 'dhis_instance_3' },
  },
  {
    data_element_code: 'DE_3_MAPPED',
    country_code: 'TO',
    service_type: 'dhis',
    service_config: { dhisInstanceCode: 'dhis_instance_3' },
  },
  // DE_4_MAPPED_INVALID has multiple mappings for the same country, not allowed
  {
    data_element_code: 'DE_4_MAPPED_INVALID',
    country_code: 'FJ',
    service_type: 'dhis',
    service_config: { dhisInstanceCode: 'dhis_instance_2' },
  },
  {
    data_element_code: 'DE_4_MAPPED_INVALID',
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
