/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { modelClasses as baseModelClasses, ModelRegistry, TupaiaDatabase } from '@tupaia/database';

import { modelClasses } from './modelClasses';

let database;

export const getModels = () => {
  if (!database) {
    database = new TupaiaDatabase();
  }
  return new ModelRegistry(database, { ...baseModelClasses, ...modelClasses });
};
