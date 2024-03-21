/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { ServerBoilerplateModelRegistry } from '@tupaia/server-boilerplate';

type Models = 'dataTable' | 'externalDatabaseConnection' | 'entity';

export type DataTableServerModelRegistry = Pick<ServerBoilerplateModelRegistry, Models>;
