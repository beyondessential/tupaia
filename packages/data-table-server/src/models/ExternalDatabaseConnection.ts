/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  ExternalDatabaseConnectionModel as BaseExternalDatabaseConnectionModel,
  ExternalDatabaseConnectionRecord as BaseExternalDatabaseConnectionRecord,
} from '@tupaia/database';
import { ExternalDatabaseConnection as ExternalDatabaseConnectionFields } from '@tupaia/types';
import { Model } from '@tupaia/server-boilerplate';

export interface ExternalDatabaseConnectionRecord
  extends ExternalDatabaseConnectionFields,
    Omit<BaseExternalDatabaseConnectionRecord, 'id'> {}

export interface ExternalDatabaseConnectionModel
  extends Model<
    BaseExternalDatabaseConnectionModel,
    ExternalDatabaseConnectionFields,
    ExternalDatabaseConnectionRecord
  > {}
