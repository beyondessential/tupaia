/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import { addBaselineTestData } from './addBaselineTestData';
import { getModels } from './getModels';
import { clearAllTestData } from '@tupaia/database';

export async function resetTestData() {
  const models = getModels();
  await clearAllTestData(models.database);
  await addBaselineTestData();
}
