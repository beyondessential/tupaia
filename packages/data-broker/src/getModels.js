/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';

import { modelClasses } from './modelClasses';

const database = new TupaiaDatabase();

export const getModels = () => {
  return new ModelRegistry(database, modelClasses);
};
