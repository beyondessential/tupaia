import { clearTestData } from '@tupaia/database';
import { addBaselineTestData } from './addBaselineTestData';
import { getModels } from './getModels';

export async function resetTestData() {
  const models = getModels();
  await clearTestData(models.database);
  await addBaselineTestData();
}
