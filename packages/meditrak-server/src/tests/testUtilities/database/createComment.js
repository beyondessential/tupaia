import { getModels } from '../../getModels';
import { upsertRecord } from './upsertRecord';

const models = getModels();

export const createComment = async () => {};

/*
export const createComment = async key => {
  const entity = await createEntity(key);
  const dataElement = await createDataElement(key);
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
*/
