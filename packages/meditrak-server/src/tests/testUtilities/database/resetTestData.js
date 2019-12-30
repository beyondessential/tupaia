/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import { clearTestData } from './clearTestData';
import { addBaselineTestData } from './addBaselineTestData';

export async function resetTestData() {
  await clearTestData();
  await addBaselineTestData();
}
