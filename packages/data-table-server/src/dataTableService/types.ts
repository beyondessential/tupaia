import { DataTableServerModelRegistry } from '../types';
import { TupaiaApiClient } from '@tupaia/api-client';
import { AccessPolicy } from '@tupaia/access-policy';

/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

export type DataTableServiceContext = {
  apiClient: TupaiaApiClient;
  accessPolicy: AccessPolicy;
  models: DataTableServerModelRegistry;
};

export interface DataTableParameter {
  name: string;
  config: DataTableParameterConfig;
}

export interface DataTableParameterConfig {
  type: string;
  defaultValue?: unknown;
  innerType?: DataTableParameterConfig;
  oneOf?: unknown[];
  required?: boolean;
}
