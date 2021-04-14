/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';

export class MaterializedViewLogDatabaseModel extends DatabaseModel {
  async fetchSchema() {
    if (!this.schema) {
      const realSchema = await super.fetchSchema();
      delete realSchema.m_row$; // Remove the m_row$ field from the schema notation
      this.schema = realSchema;
    }
    return this.schema;
  }
}
