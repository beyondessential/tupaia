import { getModels } from '../../getModels';

const models = getModels();

export const createAlert = async (code = 'ABC', name = 'XYZ') => {
  const entity = await models.entity.create({ code, name });

  const dataElement = await models.dataSource.create({
    code,
    type: 'dataElement',
    service_type: 'dhis',
    config: {},
  });

  const alert = await models.alert.create({
    entity_id: entity.id,
    data_element_id: dataElement.id,
    start_time: new Date().toISOString(),
  });

  return { entity, dataElement, alert };
};
