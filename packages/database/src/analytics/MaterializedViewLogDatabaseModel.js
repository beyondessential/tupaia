/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';

export class MaterializedViewLogDatabaseModel extends DatabaseModel {
  async fetchSchema() {
    this.schemaPromise = await super.fetchSchema();

    if ('m_row$' in this.schemaPromise) {
      delete this.schemaPromise.m_row$; // Remove the m_row$ field from the schema notation
    }

    return this.schemaPromise;
  }
}
