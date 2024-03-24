/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import * as dotenv from 'dotenv';
import path from 'path';
import { ModelRegistry } from '../ModelRegistry';
import { TupaiaDatabase } from '../TupaiaDatabase';

let database = null;

dotenv.config({
  path: [
    path.resolve(__dirname, '../../.env.db'),
    path.resolve(__dirname, '../../.env.pg'),
    path.resolve(__dirname, '.env'),
  ],
}); // Load the environment variables into process.env

export function getTestDatabase() {
  if (!database) {
    database = new TupaiaDatabase();
  }
  return database;
}

export function getTestModels() {
  return new ModelRegistry(getTestDatabase(), {}, true);
}
