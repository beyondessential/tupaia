import { getModels } from '../../getModels';
import { upsertRecord } from './upsertRecord';

const models = getModels();

export const createAlert = async (code = 'ABC', name = 'XYZ') => {
  const entity = await upsertRecord(models.entity, { code, name });

  const dataElement = await upsertRecord(models.dataSource, {
    code,
    type: 'dataElement',
    service_type: 'dhis',
  });

  const alert = await upsertRecord(models.alert, {
    entity_id: entity.id,
    data_element_id: dataElement.id,
    start_time: new Date().toISOString(),
    end_time: null,
    event_confirmed_time: null,
    archived: false,
  });

  return { entity, dataElement, alert };
};
