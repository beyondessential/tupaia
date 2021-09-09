/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import {} from 'dotenv/config';
import { ModelRegistry } from '../ModelRegistry';
import { TupaiaDatabase } from '../TupaiaDatabase';
import { generateTestId } from './generateTestId';

let database = null;

export function getTestDatabase() {
  if (!database) {
    database = new TupaiaDatabase();
    database.generateId = generateTestId;
  }
  return database;
}

export function getTestModels() {
  return new ModelRegistry(getTestDatabase(), {}, true);
}
