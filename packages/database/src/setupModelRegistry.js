/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDatabase } from './TupaiaDatabase';
import { ModelRegistry } from './ModelRegistry';

// Sets up a TupaiaDatabase and a ModelRegistry with the common models stored in this package
export function setupModelRegistry(modelClasses) {
  const database = new TupaiaDatabase();
  const models = new ModelRegistry(database, modelClasses);
  return models;
}
