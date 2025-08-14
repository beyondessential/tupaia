import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaApiClient } from '@tupaia/api-client';
import { DataTableRecord } from '@tupaia/database';
import { DataTableService } from '../../dataTableService';
import { DataTableServerModelRegistry } from '../../types';

declare global {
  namespace Express {
    export interface Request {
      accessPolicy: AccessPolicy;
      models: DataTableServerModelRegistry;
      ctx: {
        services: TupaiaApiClient;
        dataTable: DataTableRecord;
        dataTableService: DataTableService;
      };
    }
  }
}
