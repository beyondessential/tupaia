/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';

export class MaterializedViewLogDatabaseModel extends DatabaseModel {
  async fetchSchema() {
    if (!this.schemaPromise) {
      const realSchemaPromise = await super.fetchSchema();
      delete realSchemaPromise.m_row$; // Remove the m_row$ field from the schema notation
      this.schemaPromise = realSchemaPromise;
    }
    return this.schemaPromise;
  }
}
