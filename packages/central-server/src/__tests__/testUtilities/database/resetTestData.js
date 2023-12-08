/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import { clearAllTestData } from '@tupaia/database';
import { addBaselineTestData } from './addBaselineTestData';
import { getModels } from './getModels';

export async function resetTestData() {
  const models = getModels();
  await clearAllTestData(models.database);
  await addBaselineTestData();
}
