/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaApiClient } from '@tupaia/api-client';
import { DataTableType } from '@tupaia/server-boilerplate';
import { DataTableService } from '../../dataTableService';
import { DataTableServerModelRegistry } from '../../types';

declare global {
  namespace Express {
    export interface Request {
      accessPolicy: AccessPolicy;
      models: DataTableServerModelRegistry;
      ctx: {
        services: TupaiaApiClient;
        dataTable: DataTableType;
        dataTableService: DataTableService;
      };
    }
  }
}
