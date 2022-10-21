/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { DataTableService } from './DataTableService';

export type ServiceContext<Type> = Type extends DataTableService<infer Context> ? Context : never;

export type ClassOfDataTableService<Service extends DataTableService> = new (
  context: ServiceContext<Service>,
  config: unknown,
) => Service;
