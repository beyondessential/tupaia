/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { upsertDummyRecord } from '@tupaia/database';
import { TestModelRegistry } from '../../types';

export const upsertDummyQuestion = async (models: TestModelRegistry) => {
  const dataElement = await upsertDummyRecord(models.dataElement, {
    service_type: 'tupaia',
  });
  return upsertDummyRecord(models.question, {
    code: dataElement.code,
    data_element_id: dataElement.id,
  });
};
