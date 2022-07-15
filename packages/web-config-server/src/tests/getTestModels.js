/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { TupaiaDatabase, ModelRegistry } from '@tupaia/database';
import { modelClasses } from '/models';

let modelsSingleton = null;
export function getTestModels() {
  if (!modelsSingleton) {
    const database = new TupaiaDatabase();
    modelsSingleton = new ModelRegistry(database, modelClasses);
  }

  return modelsSingleton;
}
