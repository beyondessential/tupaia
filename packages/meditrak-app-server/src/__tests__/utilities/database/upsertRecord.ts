import { upsertDummyRecord } from '@tupaia/database';
import { TestModelRegistry } from '../../types';

export const upsertEntity = async (models: TestModelRegistry, data = {}) => {
  return upsertDummyRecord(models.entity, data);
};

export const upsertUserEntityPermission = async (models: TestModelRegistry, data = {}) => {
  return upsertDummyRecord(models.userEntityPermission, data);
};

export const upsertCountry = async (models: TestModelRegistry, data = {}) => {
  return upsertDummyRecord(models.country, data);
};

export const upsertFacility = async (models: TestModelRegistry, data = {}) => {
  return upsertDummyRecord(models.facility, data);
};

export const upsertQuestion = async (models: TestModelRegistry, data = { id: '', code: '' }) => {
  const { code } = data;

  const dataElement = await upsertDummyRecord(models.dataElement, {
    service_type: 'tupaia',
    ...data,
    code,
  });
  return upsertDummyRecord(models.question, {
    ...data,
    code: dataElement.code,
    data_element_id: dataElement.id,
    type: 'FreeText',
  });
};

export const upsertPermissionGroup = async (models: TestModelRegistry, data = {}) => {
  return upsertDummyRecord(models.permissionGroup, data);
};

export const insertEntityAndFacility = async (
  models: TestModelRegistry,
  { entity, facility }: { entity?: any; facility: any },
) => {
  const country = await upsertDummyRecord(models.country, {});
  const entityObject = await upsertEntity(models, {
    ...entity,
    type: models.entity.types.FACILITY,
  });
  const area = await upsertDummyRecord(models.geographicalArea, { country_id: country.id });
  const facilityObject = await upsertFacility(models, {
    ...facility,
    code: entityObject.code,
    country_id: country.id,
    geographical_area_id: area.id,
  });

  return { entity: entityObject, facility: facilityObject };
};
