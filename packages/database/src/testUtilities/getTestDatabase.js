/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import {} from 'dotenv/config';
import { ModelRegistry } from '../ModelRegistry';
import { TupaiaDatabase } from '../TupaiaDatabase';

let database = null;

export function getTestDatabase() {
  if (!database) {
    database = new TupaiaDatabase();
  }
  return database;
}

export function getTestModels() {
  return new ModelRegistry(getTestDatabase(), {}, true);
}
