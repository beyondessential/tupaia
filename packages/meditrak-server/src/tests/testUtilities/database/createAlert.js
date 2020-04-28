import { getModels } from '../../getModels';

const models = getModels();

export const createAlert = async () => {
  const testEntity = await models.entity.create({
    code: 'ABC',
    name: 'ABC',
  });

  const testDataElement = await models.dataSource.create({
    code: 'DEF',
    type: 'dataElement',
    service_type: 'dhis',
    config: {},
  });

  const testAlert = await models.alert.create({
    entity_id: testEntity.id,
    data_element_id: testDataElement.id,
    start_time: new Date().toISOString(),
  });

  return { testEntity, testDataElement, testAlert };
};
