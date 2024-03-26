/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { ModelRegistry } from '../ModelRegistry';
import { TupaiaDatabase } from '../TupaiaDatabase';
import { configureEnv } from '../configureEnv';

let database = null;

configureEnv();

export function getTestDatabase() {
  if (!database) {
    database = new TupaiaDatabase();
  }
  return database;
}

export function getTestModels() {
  return new ModelRegistry(getTestDatabase(), {}, true);
}
