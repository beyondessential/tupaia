import { ModelRegistry, getTestDatabase } from '@tupaia/database';
import * as modelClasses from '../../../database/models';

let modelsSingleton = null;
export function getModels() {
  if (!modelsSingleton) {
    const database = getTestDatabase();
    modelsSingleton = new ModelRegistry(database, modelClasses, true);
  }

  return modelsSingleton;
}
