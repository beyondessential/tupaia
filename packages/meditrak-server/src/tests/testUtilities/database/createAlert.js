/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { upsertDummyRecord } from '@tupaia/database';
import { getModels } from '../../getModels';

const models = getModels();

export const createEntity = async key => {
  return upsertDummyRecord(models.entity, { code: key, name: key });
};

export const createDataElement = async key => {
  return upsertDummyRecord(models.dataSource, {
    code: key,
    type: 'dataElement',
    service_type: 'dhis',
  });
};

export const createAlert = async key => {
  const entity = await createEntity(key);
  const dataElement = await createDataElement(key);
  const alert = await upsertDummyRecord(models.alert, {
    entity_id: entity.id,
    data_element_id: dataElement.id,
    start_time: new Date().toISOString(),
    end_time: null,
    event_confirmed_time: null,
    archived: false,
  });

  return { entity, dataElement, alert };
};
