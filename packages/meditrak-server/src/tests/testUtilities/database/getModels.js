/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDatabase, ModelRegistry } from '@tupaia/database';
import * as modelClasses from '../../../database/models';

let modelsSingleton = null;
export function getModels() {
  if (!modelsSingleton) {
    const database = new TupaiaDatabase();
    modelsSingleton = new ModelRegistry(database, modelClasses, true);
  }

  return modelsSingleton;
}
