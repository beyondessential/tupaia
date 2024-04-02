/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry } from '@tupaia/database';
import {
  DataTableModel,
  EntityModel,
  ExternalDatabaseConnectionModel,
} from '@tupaia/server-boilerplate';

export interface DataTableServerModelRegistry extends ModelRegistry {
  readonly dataTable: DataTableModel;
  readonly entity: EntityModel;
  readonly externalDatabaseConnection: ExternalDatabaseConnectionModel;
}
