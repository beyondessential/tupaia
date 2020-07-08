/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { TupaiaDatabase, ModelRegistry } from '@tupaia/database';

export const getTestModels = () => {
  const database = new TupaiaDatabase();
  return new ModelRegistry(database);
};
