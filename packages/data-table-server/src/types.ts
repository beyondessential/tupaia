/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { ModelRegistry } from '@tupaia/database';
import { DataTableModel, ExternalDatabaseConnectionModel } from './models';

export interface DataTableServerModelRegistry extends ModelRegistry {
  readonly dataTable: DataTableModel;
  readonly externalDatabaseConnection: ExternalDatabaseConnectionModel;
}
