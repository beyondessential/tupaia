/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDatabase, ModelRegistry } from '../database';

let modelsSingleton = null;
export function getModels() {
  if (!modelsSingleton) {
    const database = new TupaiaDatabase();
    modelsSingleton = new ModelRegistry(database);
  }

  return modelsSingleton;
}
