/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import {} from 'dotenv/config';
import { TupaiaDatabase } from '../TupaiaDatabase';

let database = null;

export function getDatabase() {
  if (!database) {
    database = new TupaiaDatabase();
  }
  return database;
}
