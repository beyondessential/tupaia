/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  ExternalDatabaseConnectionModel as BaseExternalDatabaseConnectionModel,
  ExternalDatabaseConnectionType as BaseExternalDatabaseConnectionType,
} from '@tupaia/database';
import { ExternalDatabaseConnection as ExternalDatabaseConnectionFields } from '@tupaia/types';
import { Model } from '@tupaia/server-boilerplate';

export interface ExternalDatabaseConnectionType
  extends ExternalDatabaseConnectionFields,
    Omit<BaseExternalDatabaseConnectionType, 'id'> {}

export interface ExternalDatabaseConnectionModel
  extends Model<
    BaseExternalDatabaseConnectionModel,
    ExternalDatabaseConnectionFields,
    ExternalDatabaseConnectionType
  > {}
