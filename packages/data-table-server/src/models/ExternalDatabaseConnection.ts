/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  ExternalDatabaseConnectionModel as BaseExternalDatabaseConnectionModel,
  ExternalDatabaseConnectionType as BaseExternalDatabaseConnectionType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';

export type ExternalDatabaseConnectionFields = Readonly<{
  id: string;
  code: string;
  description: string | null;
  permission_groups: string[];
  host: string;
  port: string;
  database_name: string;
  username: string;
  password_base_64: Record<string, unknown>;
}>;

export interface ExternalDatabaseConnectionType
  extends ExternalDatabaseConnectionFields,
    Omit<BaseExternalDatabaseConnectionType, 'id'> {}

export interface ExternalDatabaseConnectionModel
  extends Model<
    BaseExternalDatabaseConnectionModel,
    ExternalDatabaseConnectionFields,
    ExternalDatabaseConnectionType
  > {}
